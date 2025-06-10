# Project2-FrontEnd - Book Store React App

## Mô tả dự án

Đây là ứng dụng quản lý và bán sách trực tuyến, xây dựng bằng ReactJS và Ant Design. Ứng dụng hỗ trợ:
- Xem danh sách sách, tìm kiếm, lọc, phân trang
- Xem sách mới nhất, sách bán chạy
- Quản lý sách theo danh mục
- Thêm, sửa, xóa sách (chỉ dành cho admin)
- Thêm vào giỏ hàng, mua ngay (dành cho user)
- Giao diện responsive, hiện đại, đồng nhất ở mọi phần

## Tính năng chính

- **Trang chủ:** Hiển thị sách mới nhất, sách bán chạy, tìm kiếm sách
- **Danh mục:** Xem sách theo từng danh mục, giao diện đồng nhất
- **Quản trị:** Admin có thể thêm, sửa, xóa sách
- **Giỏ hàng:** Thêm vào giỏ, mua ngay (user)
- **Phân trang:** Hỗ trợ phân trang, tìm kiếm nâng cao
- **Đồng bộ giao diện:** BookCard hiển thị giống nhau ở mọi nơi

## Công nghệ sử dụng

- ReactJS (Hooks, Context)
- Ant Design UI
- Axios (gọi API)
- React Router DOM
- Cloudinary (lưu trữ ảnh)
- CSS modules/custom CSS

## Cài đặt & chạy dự án

### 1. Clone code về máy
```bash
git clone <repo-url>
cd Project2-FrontEnd
```

### 2. Cài đặt dependencies
```bash
npm install
```

### 3. Cấu hình môi trường (nếu cần)
- Tạo file `.env` và cấu hình các biến môi trường (API endpoint, Cloudinary, ...)

### 4. Chạy ứng dụng
```bash
npm run dev
```
Truy cập [http://localhost:5173](http://localhost:5173)

## Cấu trúc thư mục

```
src/
  components/
    book/           // Các component liên quan đến sách
    common/         // Các component dùng chung (BookImage, Avatar, ...)
    context/        // Context API (auth, cart, ...)
  pages/            // Các trang chính (BooksPage, CategoryBooksPage, ...)
  services/         // Gọi API
  styles/           // CSS
```

## Đóng góp

- Fork repo, tạo branch mới, commit và gửi pull request.
- Mọi ý kiến đóng góp về UI/UX, tính năng mới đều được hoan nghênh!

## Liên hệ

- Email: [dodinhtrungthptyv@gmail.com]

## 🤝 Đóng góp
Mọi đóng góp, pull request hoặc issue đều được hoan nghênh!

## 📄 License
MIT

---
> **Book Store FrontEnd** - Project2 - 2025  
> Tác giả: [trung2604](https://github.com/trung2604)
