document.addEventListener("DOMContentLoaded", function () {
    
    // ==========================================================================
    // 1. KHỞI TẠO BỘ NHỚ GIỎ HÀNG & CÁC BIẾN TOÀN CỤC
    // ==========================================================================
    let cartItems = JSON.parse(localStorage.getItem("lingstong_cart")) || [];
    const cartButton = document.querySelector(".btn-cart");

    // Tự động bơm khung nổi (Modal) giỏ hàng vào đáy trang trình duyệt
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

    // Làm mới số liệu hiển thị lên thanh header ngay khi mở web
    renderCartView();

    // ==========================================================================
    // 2. CÁC HÀM XỬ LÝ GIAO DIỆN & DỮ LIỆU GIỎ HÀNG
    // ==========================================================================
    function showNotification(message, isDanger = false) {
        const notification = document.createElement("div");
        notification.textContent = message;
        Object.assign(notification.style, {
            position: "fixed", top: "80px", right: "20px",
            backgroundColor: isDanger ? "#ff4757" : "#2ed573", color: "#ffffff",
            padding: "12px 25px", borderRadius: "8px", fontWeight: "bold",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)", zIndex: "10001",
            transition: "all 0.4s ease", opacity: "0", transform: "translateY(-20px)",
            fontFamily: "sans-serif"
        });
        document.body.appendChild(notification);
        setTimeout(() => { notification.style.opacity = "1"; notification.style.transform = "translateY(0)"; }, 10);
        setTimeout(() => {
            notification.style.opacity = "0"; notification.style.transform = "translateY(-20px)";
            setTimeout(() => notification.remove(), 400);
        }, 2500);
    }

    function renderCartView() {
        const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        
        if (cartButton) {
            const counterSpan = document.getElementById("cart-counter") || cartButton.querySelector("span");
            if (counterSpan) counterSpan.textContent = totalQuantity;
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
            let rawPrice = String(item.price || "0");
            const cleanPrice = parseInt(rawPrice.replace(/\./g, "").replace("đ", "").trim()) || 0;
            totalPrice += cleanPrice * item.quantity;

            const itemRow = document.createElement("div");
            Object.assign(itemRow.style, {
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "10px 0", borderBottom: "1px solid #f1f2f6", gap: "10px", fontFamily: "sans-serif"
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

    function addItemToCart(title, price, image) {
        const existingItem = cartItems.find(item => item.title === title);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cartItems.push({ title, price, image, quantity: 1 });
        }
        localStorage.setItem("lingstong_cart", JSON.stringify(cartItems));
        renderCartView();
    }

    // Lắng nghe click thêm & xóa sản phẩm toàn trang
    document.body.addEventListener("click", function (event) {
        const target = event.target;

        const btnAddToCart = target.closest(".add-to-cart-btn");
        if (btnAddToCart) {
            event.preventDefault();
            const productCard = btnAddToCart.closest(".product-card");
            if (!productCard) return;

            const title = productCard.querySelector(".product-title").textContent.trim();
            const price = productCard.querySelector(".product-price").textContent.trim();
            const image = productCard.querySelector(".product-image").getAttribute("src");

            addItemToCart(title, price, image);
            showNotification(`🎉 Đã thêm thành công ${title} vào giỏ hàng!`);
            return;
        }

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

    // Sự kiện đóng/mở Modal giỏ hàng
    if (cartButton) {
        cartButton.addEventListener("click", function (e) {
            e.preventDefault();
            if (cartModal) {
                cartModal.style.display = "flex";
                setTimeout(() => cartModal.style.opacity = "1", 10);
                renderCartView();
            }
        });
    }

    document.body.addEventListener("click", function(e) {
        if (e.target.id === "closeModal" || e.target === cartModal) {
            if (cartModal) {
                cartModal.style.opacity = "0";
                setTimeout(() => cartModal.style.display = "none", 300);
            }
        }
    });

    // ==========================================================================
    // 🌟 3. TÍNH NĂNG NÂNG CẤP: LỌC DANH MỤC & TÌM KIẾM (DÀNH CHO PRODUCTS.HTML)
    // ==========================================================================
    const tabItems = document.querySelectorAll(".category-tabs .tab-item");
    const searchInput = document.getElementById("search-input");
    const productCards = document.querySelectorAll("#products-grid .product-card");

    // Chỉ thực thi bộ lọc nếu các phần tử này tồn tại trên giao diện hiện tại
    if (productCards.length > 0) {
        let currentCategory = "tất cả";
        let currentSearchQuery = "";

        /**
         * Hàm cốt lõi kết hợp đồng thời cả Lọc Danh Mục và Từ Khóa Tìm Kiếm
         */
        function filterProducts() {
            productCards.forEach(card => {
                const titleText = card.querySelector(".product-title").textContent.toLowerCase();
                
                // Trực quan hóa danh mục bằng cách tìm từ khóa xuất hiện trong tiêu đề
                const matchesCategory = (currentCategory === "tất cả") || titleText.includes(currentCategory);
                const matchesSearch = titleText.includes(currentSearchQuery);

                // Nếu thỏa mãn cả 2 điều kiện thì hiện, ngược lại thì ẩn
                if (matchesCategory && matchesSearch) {
                    card.style.display = "block";
                } else {
                    card.style.display = "none";
                }
            });
        }

        // A. Xử lý sự kiện khi click vào các tab danh mục
        tabItems.forEach(tab => {
            tab.addEventListener("click", function () {
                // Loại bỏ class active ở nút cũ, gán sang nút vừa ấn
                tabItems.forEach(item => item.classList.remove("active"));
                this.classList.add("active");

                // Lấy tên danh mục (Chuyển thành chữ thường để so sánh chính xác)
                currentCategory = this.textContent.trim().toLowerCase();

                // Kích hoạt bộ lọc kết hợp
                filterProducts();
            });
        });

        // B. Xử lý sự kiện khi gõ vào ô tìm kiếm (Realtime Search)
        if (searchInput) {
            searchInput.addEventListener("input", function () {
                currentSearchQuery = this.value.trim().toLowerCase();
                
                // Kích hoạt bộ lọc kết hợp
                filterProducts();
            });
        }
    }
});