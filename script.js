document.addEventListener("DOMContentLoaded", function () {
	// 1. KHỞI TẠO BỘ NHỚ GIỎ HÀNG (Lấy rác cũ ra hoặc tạo mảng mới)
	let cartItems = JSON.parse(localStorage.getItem("lingstong_cart")) || [];

	// 2. Tìm chính xác nút Giỏ hàng trên Header (.btn-cart)
	const cartButton = document.querySelector(".btn-cart");

	// 3. TỰ ĐỘNG BƠM KHUNG NỔI (MODAL) GIỎ HÀNG VÀO ĐÁY TRANG TRÌNH DUYỆT
	if (!document.getElementById("cartModal")) {
		const modalMarkup = `
            <div id="cartModal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); display: none; justify-content: center; align-items: center; z-index: 10000; transition: opacity 0.3s ease;">
                <div style="background: #ffffff; width: 90%; max-width: 500px; border-radius: 15px; padding: 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); position: relative; max-height: 80vh; display: flex; flex-direction: column;">
                    <span id="closeModal" style="position: absolute; top: 15px; right: 20px; font-size: 28px; cursor: pointer; color: #57606f; font-weight: bold;">&times;</span>
                    <h2 style="color: #0a3d62; margin-bottom: 20px; border-bottom: 2px solid #00bfff; padding-bottom: 10px; font-family: sans-serif;">Giỏ Hàng Của Bạn</h2>
                    
                    <div id="modalCartList" style="overflow-y: auto; flex-grow: 1; margin-bottom: 20px; padding-right: 5px;"></div>

                    <div style="border-top: 1px solid #e0e6ed; padding-top: 15px; display: flex; justify-content: space-between; align-items: center; font-weight: bold; font-size: 18px; color: #0a3d62; margin-bottom: 15px; font-family: sans-serif;">
                        <span>Tổng cộng:</span>
                        <span id="modalTotalCartPrice">0 đ</span>
                    </div>

                    <button style="background: #0a3d62; color: #fff; border: none; padding: 12px; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 16px; width: 100%;" onclick="alert('Tính năng thanh toán đang được phát triển!')">Tiến Hành Thanh Toán</button>
                </div>
            </div>
        `;
		document.body.insertAdjacentHTML("beforeend", modalMarkup);
	}

	const cartModal = document.getElementById("cartModal");
	const modalCartList = document.getElementById("modalCartList");
	const modalTotalCartPrice = document.getElementById("modalTotalCartPrice");

	// Ép làm mới số liệu hiển thị lên thanh header ngay khi mở web
	renderCartView();

	/**
	 * Hàm vẽ bảng thông báo Toast màu xanh / đỏ nổi lên góc màn hình
	 */
	function showNotification(message, isDanger = false) {
		const notification = document.createElement("div");
		notification.textContent = message;
		Object.assign(notification.style, {
			position: "fixed",
			top: "80px",
			right: "20px",
			backgroundColor: isDanger ? "#ff4757" : "#2ed573",
			color: "#ffffff",
			padding: "12px 25px",
			borderRadius: "8px",
			fontWeight: "bold",
			boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
			zIndex: "10001",
			transition: "all 0.4s ease",
			opacity: "0",
			transform: "translateY(-20px)",
			fontFamily: "sans-serif",
		});
		document.body.appendChild(notification);
		setTimeout(() => {
			notification.style.opacity = "1";
			notification.style.transform = "translateY(0)";
		}, 10);
		setTimeout(() => {
			notification.style.opacity = "0";
			notification.style.transform = "translateY(-20px)";
			setTimeout(() => notification.remove(), 400);
		}, 2500);
	}

	/**
	 * Hàm vẽ giao diện giỏ hàng bên trong hộp Modal và đếm tổng số lượng sản phẩm
	 */
	function renderCartView() {
		const totalQuantity = cartItems.reduce(
			(sum, item) => sum + item.quantity,
			0,
		);

		// Đếm số lượng cập nhật vào Header
		if (cartButton) {
			const counterSpan =
				document.getElementById("cart-counter") ||
				cartButton.querySelector("span");
			if (counterSpan) {
				counterSpan.textContent = totalQuantity;
			} else {
				cartButton.textContent = `Giỏ hàng (${totalQuantity})`;
			}
		}

		if (!modalCartList) return;
		modalCartList.innerHTML = "";

		if (cartItems.length === 0) {
			modalCartList.innerHTML = `<p style="text-align: center; color: #57606f; margin-top: 20px; font-style: italic; font-family: sans-serif;">Giỏ hàng của bạn đang trống.</p>`;
			modalTotalCartPrice.textContent = "0 đ";
			return;
		}

		let totalPrice = 0;

		cartItems.forEach((item, index) => {
			// Chuẩn hóa và làm sạch chuỗi tiền tệ (ví dụ "10.000 đ" thành số 10000)
			let rawPrice = String(item.price || "0");
			const cleanPrice =
				parseInt(rawPrice.replace(/\./g, "").replace("đ", "").trim()) || 0;

			const itemTotal = cleanPrice * item.quantity;
			totalPrice += itemTotal;

			const itemRow = document.createElement("div");
			Object.assign(itemRow.style, {
				display: "flex",
				alignItems: "center",
				justifyContent: "space-between",
				padding: "10px 0",
				borderBottom: "1px solid #f1f2f6",
				gap: "10px",
				fontFamily: "sans-serif",
			});

			itemRow.innerHTML = `
                <div style="display: flex; align-items: center; gap: 15px;">
                    <img src="${item.image}" alt="${item.title}" style="width: 50px; height: 50px; object-fit: contain; background: #f4f7f9; border-radius: 8px; padding: 4px;">
                    <div>
                        <h4 style="color: #0a3d62; font-size: 15px; margin-bottom: 2px; margin-top: 0;">${item.title}</h4>
                        <span style="color: #ff4757; font-weight: bold; font-size: 14px;">${cleanPrice.toLocaleString("vi-VN")} đ <span style="color:#666; font-weight:normal; font-size:12px;">x${item.quantity}</span></span>
                    </div>
                </div>
                <button class="delete-item-btn" data-index="${index}" style="background: none; border: 1px solid #ff4757; color: #ff4757; padding: 5px 10px; border-radius: 15px; font-size: 12px; cursor: pointer; font-weight: bold;">Xóa</button>
            `;
			modalCartList.appendChild(itemRow);
		});

		modalTotalCartPrice.textContent = totalPrice.toLocaleString("vi-VN") + " đ";
	}

	/**
	 * Hàm tiếp nhận thông tin bốc từ HTML đẩy vào trong mảng dữ liệu LocalStorage
	 */
	function addItemToCart(title, price, image) {
		const existingItem = cartItems.find((item) => item.title === title);
		if (existingItem) {
			existingItem.quantity += 1;
		} else {
			cartItems.push({ title, price, image, quantity: 1 });
		}

		localStorage.setItem("lingstong_cart", JSON.stringify(cartItems));
		renderCartView();
	}

	// ==========================================================================
	// 🌟 KHU VỰC EVENT DELEGATION LẮNG NGHE CLICK CHUNG TOÀN TRANG
	// ==========================================================================
	document.body.addEventListener("click", function (event) {
		const target = event.target;

		// Hành động 1: Click nút "Thêm vào giỏ" ở trang chủ hoặc trang sản phẩm
		const btnAddToCart = target.closest(".add-to-cart-btn");
		if (btnAddToCart) {
			event.preventDefault();

			const productCard = btnAddToCart.closest(".product-card");
			if (!productCard) return;

			const titleEl = productCard.querySelector(".product-title");
			const priceEl = productCard.querySelector(".product-price");
			const imgEl = productCard.querySelector(".product-image");

			if (!titleEl || !priceEl) return;

			const title = titleEl.textContent.trim();
			const price = priceEl.textContent.trim();
			const image = imgEl ? imgEl.getAttribute("src") : "assets/sting-do.png";

			addItemToCart(title, price, image);
			showNotification(`🎉 Đã thêm thành công ${title} vào giỏ hàng!`);
			return;
		}

		// Hành động 2: Click vào nút bấm "Mua Ngay Bản Giới Hạn" trên banner lớn của trang chủ
		const btnHeroLimited = target.closest(".hero-btn-limited");
		if (btnHeroLimited) {
			event.preventDefault();
			addItemToCart(
				"Sting - Vị nhân sâm cao cấp",
				"15.000 đ",
				"assets/sting-max-gold.png",
			);
			showNotification("🚀 Đã thêm phiên bản giới hạn vào giỏ hàng!");
			return;
		}

		// Hành động 3: Click xóa từng dòng sản phẩm trong bảng giỏ hàng
		const btnDelete = target.closest(".delete-item-btn");
		if (btnDelete) {
			const itemIndex = parseInt(btnDelete.getAttribute("data-index"));
			const removedItemTitle = cartItems[itemIndex].title;

			cartItems.splice(itemIndex, 1);
			localStorage.setItem("lingstong_cart", JSON.stringify(cartItems));

			renderCartView();
			showNotification(`🗑️ Đã xóa ${removedItemTitle} khỏi giỏ hàng.`, true);
			return;
		}
	});

	// ==========================================================================
	// SỰ KIỆN KÍCH HOẠT ĐÓNG / MỞ CỬA SỔ GIỎ HÀNG
	// ==========================================================================
	if (cartButton) {
		cartButton.addEventListener("click", function (e) {
			e.preventDefault();
			if (cartModal) {
				cartModal.style.display = "flex";
				setTimeout(() => (cartModal.style.opacity = "1"), 10);
				renderCartView();
			}
		});
	}

	document.body.addEventListener("click", function (e) {
		const target = e.target;
		if (target.id === "closeModal" || target === cartModal) {
			if (cartModal) {
				cartModal.style.opacity = "0";
				setTimeout(() => (cartModal.style.display = "none"), 300);
			}
		}
	});s
});
