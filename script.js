// Đợi cho toàn bộ giao diện HTML tải xong thì mới chạy code Javascript bên trong
document.addEventListener("DOMContentLoaded", function () {
	// 1. Khởi tạo mảng lưu trữ danh sách sản phẩm trong giỏ hàng
	// Mỗi sản phẩm sẽ là một đối tượng có cấu trúc: { id, title, price, image }
	let cartItems = [];

	// 2. Tìm các nút bấm trên giao diện có sẵn
	const cartButton = document.querySelector("header .btn");
	const heroButton = document.querySelector(".hero .btn");
	const addToCartButtons = document.querySelectorAll(".product-card .btn");

	// Tự động tạo cấu trúc HTML cho Cửa sổ Giỏ hàng (Modal) bằng JS và chèn vào cuối trang web
	const modalMarkup = `
        <div id="cartModal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); display: none; justify-content: center; align-items: center; z-index: 10000; transition: opacity 0.3s ease;">
            <div style="background: #ffffff; width: 90%; max-width: 500px; border-radius: 15px; padding: 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); position: relative; max-height: 80vh; display: flex; flex-direction: column;">
                <span id="closeModal" style="position: absolute; top: 15px; right: 20px; font-size: 28px; cursor: pointer; color: #57606f; font-weight: bold;">&times;</span>
                <h2 style="color: #0a3d62; margin-bottom: 20px; border-bottom: 2px solid #00bfff; padding-bottom: 10px;">Giỏ Hàng Của Bạn</h2>
                
                <!-- Khu vực hiển thị danh sách sản phẩm -->
                <div id="modalCartList" style="overflow-y: auto; flex-grow: 1; margin-bottom: 20px; padding-right: 5px;">
                    <!-- Các món ăn/nước ngọt sẽ được tự động đổ vào đây bằng JS -->
                </div>

                <!-- Tổng tiền & Nút thanh toán toán -->
                <div style="border-top: 1px solid #e0e6ed; padding-top: 15px; display: flex; justify-content: space-between; align-items: center; font-weight: bold; font-size: 18px; color: #0a3d62;">
                    <span>Tổng cộng:</span>
                    <span id="modalTotalCartPrice">0 đ</span>
                </div>
            </div>
        </div>
    `;
	document.body.insertAdjacentHTML("beforeend", modalMarkup);

	// Lấy các phần tử Modal vừa được chèn vào HTML để tương tác
	const cartModal = document.getElementById("cartModal");
	const closeModal = document.getElementById("closeModal");
	const modalCartList = document.getElementById("modalCartList");
	const modalTotalCartPrice = document.getElementById("modalTotalCartPrice");

	/**
	 * Hàm hiển thị thông báo thêm/xóa thành công (Toast Notification)
	 */
	function showNotification(message, isDanger = false) {
		const notification = document.createElement("div");
		notification.textContent = message;
		Object.assign(notification.style, {
			position: "fixed",
			top: "80px",
			right: "20px",
			backgroundColor: isDanger ? "#ff4757" : "#2ed573", // Màu đỏ nếu xóa, màu xanh nếu thêm
			color: "#ffffff",
			padding: "12px 25px",
			borderRadius: "8px",
			fontWeight: "bold",
			boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
			zIndex: "10001",
			transition: "all 0.4s ease",
			opacity: "0",
			transform: "translateY(-20px)",
		});
		document.body.appendChild(notification);
		setTimeout(() => {
			notification.style.opacity = "1";
			notification.style.transform = "translateY(0)";
		}, 10);
		setTimeout(() => {
			notification.style.opacity = "0";
			notification.style.transform = "translateY(-20px)";
			setTimeout(() => {
				notification.remove();
			}, 400);
		}, 2500);
	}

	/**
	 * Hàm đồng bộ và cập nhật lại giao diện số lượng trên Header + danh sách trong Modal
	 */
	function renderCartView() {
		// 1. Cập nhật số lượng trên nút Header
		if (cartButton) {
			cartButton.textContent = `Giỏ hàng (${cartItems.length})`;
		}

		// 2. Xóa sạch danh sách cũ trong Modal để chuẩn bị nạp dữ liệu mới nhất
		modalCartList.innerHTML = "";

		// Kiểm tra nếu giỏ hàng trống rỗng
		if (cartItems.length === 0) {
			modalCartList.innerHTML = `<p style="text-align: center; color: #57606f; margin-top: 20px; font-style: italic;">Giỏ hàng của bạn đang trống.</p>`;
			modalTotalCartPrice.textContent = "0 đ";
			return;
		}

		let totalPrice = 0;

		// 3. Duyệt mảng sản phẩm hiện có và tạo các thẻ hiển thị tương ứng
		cartItems.forEach((item, index) => {
			// Chuyển đổi định dạng giá tiền từ text sang số để tính tổng tiền
			const cleanPrice = parseInt(
				item.price.replace(/\./g, "").replace("đ", "").trim(),
			);
			totalPrice += cleanPrice;

			const itemRow = document.createElement("div");
			Object.assign(itemRow.style, {
				display: "flex",
				alignItems: "center",
				justifyContent: "space-between",
				padding: "10px 0",
				borderBottom: "1px solid #f1f2f6",
				gap: "10px",
			});

			itemRow.innerHTML = `
                <div style="display: flex; align-items: center; gap: 15px;">
                    <img src="${item.image}" alt="${item.title}" style="width: 50px; height: 50px; object-fit: contain; background: #f4f7f9; border-radius: 8px; padding: 4px;">
                    <div>
                        <h4 style="color: #0a3d62; font-size: 15px; margin-bottom: 2px;">${item.title}</h4>
                        <span style="color: #ff4757; font-weight: bold; font-size: 14px;">${item.price}</span>
                    </div>
                </div>
                <button class="delete-item-btn" data-index="${index}" style="background: none; border: 1px solid #ff4757; color: #ff4757; padding: 5px 10px; border-radius: 15px; font-size: 12px; cursor: pointer; font-weight: bold; transition: all 0.2s;">Xóa</button>
            `;

			// Thêm hiệu ứng hover đổi màu cho nút xóa của từng món
			const delBtn = itemRow.querySelector(".delete-item-btn");
			delBtn.addEventListener("mouseenter", () => {
				delBtn.style.backgroundColor = "#ff4757";
				delBtn.style.color = "white";
			});
			delBtn.addEventListener("mouseleave", () => {
				delBtn.style.backgroundColor = "transparent";
				delBtn.style.color = "#ff4757";
			});

			// Gắn sự kiện xóa khi bấm nút
			delBtn.addEventListener("click", function () {
				const itemIndex = parseInt(this.getAttribute("data-index"));
				const removedItemTitle = cartItems[itemIndex].title;

				// Xóa sản phẩm ra khỏi mảng cartItems
				cartItems.splice(itemIndex, 1);

				// Vẽ lại giao diện giỏ hàng mới
				renderCartView();

				// Hiển thị thông báo cảnh báo xóa thành công màu đỏ
				showNotification(`🗑️ Đã xóa ${removedItemTitle} khỏi giỏ hàng.`, true);
			});

			modalCartList.appendChild(itemRow);
		});

		// Cập nhật lại tổng tiền (Định dạng lại dấu chấm phần nghìn Việt Nam Đồng)
		modalTotalCartPrice.textContent = totalPrice.toLocaleString("vi-VN") + " đ";
	}

	/**
	 * Hàm xử lý khi thêm sản phẩm mới
	 */
	function addItemToCart(title, price, image) {
		// Đẩy thông tin sản phẩm mới vào mảng dữ liệu gốc
		cartItems.push({ title, price, image });

		// Gọi hàm đồng bộ giao diện toàn trang
		renderCartView();

		// Hiệu ứng nảy nhẹ nút giỏ hàng trên header
		if (cartButton) {
			cartButton.style.transform = "scale(1.15)";
			setTimeout(() => {
				cartButton.style.transform = "scale(1)";
			}, 150);
		}
	}

	// 3. Lắng nghe sự kiện click cho các nút "Thêm vào giỏ" ở từng sản phẩm
	addToCartButtons.forEach(function (button) {
		button.addEventListener("click", function () {
			const productCard = button.parentElement;
			const title = productCard.querySelector(".product-title").textContent;
			const price = productCard.querySelector(".product-price").textContent;
			const image = productCard
				.querySelector(".product-image")
				.getAttribute("src");

			addItemToCart(title, price, image);
			showNotification(`🎉 Đã thêm thành công ${title} vào giỏ hàng!`);
		});
	});

	// 4. Lắng nghe sự kiện click cho nút "Mua Ngay Bản Giới Hạn" ở Banner Hero
	if (heroButton) {
		heroButton.addEventListener("click", function () {
			// Mua ngay bản giới hạn sẽ mặc định lấy lon Sting cao cấp nhất làm đại diện
			addItemToCart(
				"Sting - Vị nhân sâm cao cấp",
				"15.000 đ",
				"assets/sting-max-gold.png",
			);
			showNotification("🚀 Đã thêm phiên bản giới hạn vào giỏ hàng!");
		});
	}

	// ==========================================================================
	// CÁC SỰ KIỆN ĐÓNG / MỞ CỬA SỔ GIỎ HÀNG (MODAL LOGIC)
	// ==========================================================================

	// Mở giỏ hàng khi nhấn vào nút Giỏ hàng trên Header
	if (cartButton) {
		cartButton.addEventListener("click", function (e) {
			e.preventDefault(); // Ngăn trình duyệt load lại trang nếu có
			cartModal.style.display = "flex";
			// Kích hoạt nhẹ độ mờ để làm mượt chuyển động xuất hiện
			setTimeout(() => {
				cartModal.style.opacity = "1";
			}, 10);
		});
	}

	// Đóng giỏ hàng khi nhấn vào dấu X thần thánh
	if (closeModal) {
		closeModal.addEventListener("click", function () {
			cartModal.style.opacity = "0";
			setTimeout(() => {
				cartModal.style.display = "none";
			}, 300);
		});
	}

	// Đóng giỏ hàng nếu người dùng click trượt ra ngoài vùng màu đen mờ
	window.addEventListener("click", function (event) {
		if (event.target === cartModal) {
			cartModal.style.opacity = "0";
			setTimeout(() => {
				cartModal.style.display = "none";
			}, 300);
		}
	});
});
