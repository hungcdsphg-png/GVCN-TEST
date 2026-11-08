# Cập nhật nhận xét AI: kết quả đạt được → hướng rèn luyện/duy trì (07/11/2026)

**Phạm vi:** Nhận xét → Nhập đánh giá thường xuyên, AI từng học sinh, AI toàn lớp, tạo bổ sung và nút Chuẩn hóa lời nhận xét.

- Mỗi nhận xét AI mới phải có hai phần rõ ràng: (1) kỹ năng hoặc kiến thức đã làm được, liên hệ nội dung KHDH hiện tại; (2) nội dung cần tiếp tục củng cố, rèn thêm hoặc duy trì/phát huy. Ưu tiên một câu với dấu chấm phẩy, hoặc hai câu ngắn có kết nối tự nhiên.
- Hướng góp ý dựa trên từng điểm nội bộ 2–10: từ 2–8 gợi ý củng cố nhẹ nhàng; 9–10 khuyến khích duy trì/phát huy, không bịa thiếu sót. Không tự thêm bài học, hành vi hay kết quả không có căn cứ.
- `validateGeneratedComment()` kiểm tra hô ngữ/đại từ nhân xưng, tên riêng, nhãn môn, điểm kỹ thuật, độ dài tối đa 250 ký tự, câu chung chung và sự liên hệ KHDH. Kiểm tra hai vế bổ sung xác nhận có hành động đã làm được ở vế đầu; nhận xét không hợp lệ được yêu cầu AI viết lại, không tự cắt hay thay từ máy móc.
- `regularEvalCommentsNearDuplicate()` và `regularEvalDuplicateAiComment()` phát hiện câu trùng hoặc rất giống nhau trong cùng lớp/môn/tháng, giữa các nhóm và với câu cũ của chính học sinh. AI chỉ tạo lại nhóm vi phạm, tối đa 3 lượt trong mỗi lần tạo; không lưu câu trùng.
- Không sửa dữ liệu điểm số, Excel, KHDH, hồ sơ học sinh, lịch sử các tháng hoặc các phân hệ khác. Nếu tháng/môn đang chọn không có bài học KHDH xác định được, AI báo rõ yêu cầu nhập KHDH hoặc kiểm tra lịch Tuần 1, không bịa nội dung. Không tự viết lại nhận xét cũ; khi cần dùng nút **Chuẩn hóa lời nhận xét**. Ô đã khóa vẫn được giữ nguyên.

**Kiểm tra:** `node --check` với tất cả khối script trong HTML, API Gemini và module KHDH; thử mô phỏng kiểm tra chất lượng câu, trùng/gần trùng, và gọi lại AI chỉ cho nhóm trả sai. Các thử nghiệm không phải là kiểm thử Gemini API hoặc Vercel trên dữ liệu thực tế.

---

# Cập nhật phong cách nhận xét hai vế (07/11/2026)

**Nhận xét → Nhập đánh giá thường xuyên:** Khi tạo bằng AI cho từng học sinh hoặc toàn lớp, nhận xét mới dùng hai vế: **kỹ năng/kiến thức đã thực hiện được → hướng tiếp tục rèn hoặc duy trì**. Ví dụ khi KHDH phù hợp: “Rút ra được bài học về thái độ trân trọng người lao động; tuy nhiên, cần mạnh dạn hơn khi bày tỏ suy nghĩ về vai trò của người lao động.”

- Điểm 2–8: vế hai góp ý rèn luyện cụ thể; 9–10: khuyến khích duy trì/phát huy, không tự gán khuyết điểm.
- Đồng bộ prompt ở `index.html` và `api/gemini.js` để cách gọi Gemini trực tiếp và qua Vercel giống nhau.
- Bổ sung kiểm tra hai vế khi AI sinh mới hoặc khi giáo viên chủ động bấm **Chuẩn hóa lời nhận xét**. Câu sai được yêu cầu viết lại, không cắt chữ; giữ giới hạn 250 ký tự, không xưng hô, bám KHDH.
- Không thay đổi điểm 2–10, dữ liệu học sinh, nhận xét đang lưu, chức năng Excel hay các module khác. Nhận xét cũ chỉ được viết lại khi giáo viên chủ động dùng **Chuẩn hóa lời nhận xét**; nhận xét đã khóa không đổi.

---

# Bản sửa lỗi: Nhập File mẫu không tự điền điểm (07/11/2026)

**Đường dẫn:** Nhận xét → Nhập đánh giá thường xuyên → Nhập File mẫu.

- Đọc đầy đủ các cột Mã/Nội dung trong mẫu Excel 13 cột và mẫu cũ 15 cột, kể cả tiêu đề hai hàng.
- Đối chiếu ưu tiên Mã định danh Bộ GD&ĐT; khi hồ sơ cũ chưa có mã, ghép bằng Họ tên + Ngày sinh và không tạo trùng. Không ghi đè khi hai mã định danh mâu thuẫn.
- Nhận diện tên lớp "3B", "Lớp 3B", "LỚP 3 B" tương đương để học sinh vẫn được hiển thị trong bảng.
- Mỗi Sheet được gắn đúng môn; điểm 2–10 của 4 nhóm lưu kiểu số; không trộn môn/tháng.
- Nếu môn đang xem chỉ có một tháng trong file nhập thành công, tự chuyển tới tháng đó để điểm hiển thị ngay.
- Cập nhật bảng trước khi chờ đồng bộ Cloud; lưu state qua cơ chế saveData() hiện hành, không tải lại trang.
- Báo số ô điểm nhập được, số dòng và lỗi; reset ô chọn file để nhập lại cùng file.
- Ô trống không xóa dữ liệu cũ; nhận xét đang khóa không bị ghi đè; không ảnh hưởng KHDH, AI, lịch sử, điểm thi đua và dữ liệu lớp.

**Kiểm thử:** 24 bài kiểm thử JavaScript mô phỏng thực thi hàm nhập với dữ liệu được đọc từ workbook Excel mẫu thực tế (3 Sheet) đều đạt. Kiểm thử trực tiếp toàn bộ giao diện Vercel và dịch vụ Firebase chưa thực hiện trên tài khoản của giáo viên.

---

# GVCN - Quét QR qua link Vercel, không dùng Firebase để kết nối

## Tích hợp Đánh giá định kỳ môn học và hoạt động giáo dục (04/09/2026)

- Mở tại **Nhận xét → Đánh giá định kỳ môn học và hoạt động giáo dục**.
- Hỗ trợ khối 1–5, đầy đủ môn học và 4 thời điểm: Giữa kì I, Cuối kì I, Giữa kì II, Cuối kì II.
- Nhập dữ liệu học sinh từ Excel; tự dò sheet theo môn học.
- Đọc PPCT/KHDH từ Excel, Word hoặc PDF, trích xuất bài học và dùng làm căn cứ tạo nhận xét.
- Tạo ngân hàng nhận xét bằng Gemini AI, tự gán theo mức T/H/C và điểm kiểm tra định kỳ.
- Xuất bảng nhận xét và ngân hàng mẫu ra Excel.
- Module nằm trong thư mục `periodic-evaluation/`, tự động dùng chung Gemini API Key được cấu hình tại **Góc Trò Chơi** và không có phần nhập API riêng.

## Tích hợp Đánh giá định kỳ năng lực và phẩm chất (04/09/2026)

- Mở tại **Nhận xét → Đánh giá định kỳ năng lực và phẩm chất**.
- Quản lý dữ liệu học sinh, năng lực chung, năng lực đặc thù và phẩm chất chủ yếu.
- Tạo thư viện mẫu nhận xét bằng Gemini AI, tự điền nhận xét theo mức T/Đ/C và xuất Excel.
- Module nằm trong thư mục `competency-quality-evaluation/`, tự động dùng chung Gemini API Key tại **Góc Trò Chơi** và không có phần nhập API riêng.

## Tích hợp Nhập nhận xét in học bạ của GVCN (04/09/2026)

- Mở tại **Nhận xét → Nhập nhận xét in học bạ của GVCN**.
- Nhập file tổng hợp kết quả giáo dục và PPCT từ Excel/PDF để tạo nhận xét học bạ cá nhân hóa.
- Tạo nhận xét AI cho toàn lớp, chỉnh sửa trực tiếp và xuất file Excel.
- Module nằm trong thư mục `report-card-comments/`, tự động dùng chung Gemini API Key tại **Góc Trò Chơi** và không có phần nhập API riêng.

## Luồng sử dụng

1. Đẩy **toàn bộ thư mục này** lên repository GitHub đang nối với Vercel.
2. Vercel deploy `index.html` và Function WebSocket tại `/api/qr-ws`.
3. Trên máy tính, mở đúng link HTTPS Vercel của app.
4. Vào **Góc Trò Chơi → Quét Thẻ QR → Bắt đầu**.
5. Máy tính tự tạo mã QR chứa chính URL Vercel + mã phiên chơi.
6. Dùng điện thoại quét mã QR đó. Điện thoại mở cùng app ở chế độ máy quét và xin quyền camera.
7. Khi camera điện thoại sẵn sàng, máy tính tự vào màn chơi. Giáo viên quét thẻ QR của từng học sinh.
8. Đáp án được chuyển giữa điện thoại và máy tính qua WebSocket `/api/qr-ws`.

## Không dùng Firebase cho kết nối QR

- Không tạo Firestore document cho phiên QR.
- Không cần Firebase Rules cho phiên QR.
- Không cần nhập link Vercel thủ công khi app đã mở từ Vercel; app tự dùng URL hiện tại.
- Firebase trong phần cũ của app (nếu bạn vẫn cấu hình) chỉ liên quan đồng bộ dữ liệu lớp, không tham gia ghép điện thoại của trò QR.

## Vercel

WebSocket trên Vercel cần Fluid Compute. Hãy kiểm tra **Project → Settings → Functions → Fluid Compute** và bật nếu project cũ chưa bật.

Lưu ý: relay trong bản này chỉ giữ phòng trong RAM của Vercel Function và không dùng database. Ở tải thấp thường rất thuận tiện, nhưng Vercel có thể chạy nhiều Function instance. Nếu cần độ tin cậy tuyệt đối khi có nhiều instance/traffic, phải dùng một lớp chia sẻ trạng thái/pub-sub (ví dụ Redis) hoặc một dịch vụ realtime riêng.


## Tạo câu hỏi nhanh bằng Google Gemini AI

1. Mở app bằng link Vercel trên máy giáo viên.
2. Vào **Góc Trò Chơi**. Lần đầu, app yêu cầu nhập **Google Gemini API Key**.
3. Nếu chưa có key, bấm **MỞ GOOGLE AI STUDIO LẤY API** → tạo API key → sao chép và dán vào app.
4. Bấm **KIỂM TRA & LƯU API**. App sẽ kiểm tra key và tự chọn model Gemini Flash phù hợp.
5. Trong **Kéo Co Kiến / Quizz Nghiêng Đầu / Quét Thẻ QR / Ngón Tay Thần Kỳ**, bấm **AI tạo nhanh** (hoặc **Tạo bằng AI**), nhập chủ đề, lớp, số câu và mức độ.
6. Chọn **Thay bộ câu hỏi hiện tại** hoặc **Thêm vào cuối**, sau đó bấm **TẠO CÂU HỎI NGAY**.

### Cách API Key được dùng

- API Key **không được ghi vào GitHub/Vercel source**.
- Key chỉ được lưu bằng `localStorage` trên trình duyệt của máy giáo viên.
- Frontend gửi key tới Vercel Function `/api/gemini` trong header `x-gemini-api-key` cho từng lần kiểm tra/tạo câu hỏi.
- Function chỉ dùng key để gọi Google Gemini API rồi trả bộ câu hỏi về; code không lưu key vào database.
- Model ưu tiên là `gemini-3.7-flash`; nếu project/key chưa dùng được model đó, Function thử lần lượt `gemini-3.6-flash`, `gemini-3.5-flash`, `gemini-2.5-flash`.

> Nếu đổi máy hoặc xóa dữ liệu trình duyệt, bạn cần nhập API Key lại.

## Cập nhật giao diện trò chơi & PDF thẻ QR

- **Quizz Nghiêng Đầu**, **Quét Thẻ QR** và **Ngón Tay Thần Kỳ** tự mở toàn màn hình ngay khi bấm **Bắt đầu**. Riêng Quét Thẻ QR, màn hình hướng dẫn ghép điện thoại xuất hiện bên trong chế độ toàn màn hình và đồng hồ chỉ chạy sau khi camera điện thoại sẵn sàng.
- Nút góc màn chơi đổi biểu tượng theo trạng thái: **mở toàn màn hình / thu màn hình**. Khi thu nhỏ về giao diện app, màn chơi vẫn giữ nguyên phiên, camera, đồng hồ, điểm số và các nút điều khiển; khu vực trò chơi có thể cuộn để mọi chức năng vẫn truy cập được.
- Ở bước ghép điện thoại của **Quét Thẻ QR**, nút **HỦY** trên cửa sổ hướng dẫn chỉ đóng cửa sổ hướng dẫn kết nối, không hủy phiên chơi. Giáo viên có thể bấm **HIỆN MÃ QR KẾT NỐI** để mở lại.
- Nút **IN THẺ PDF** tạo file PDF A4 trực tiếp trên trình duyệt, mỗi học sinh có 1 thẻ QR duy nhất với 4 hướng A/B/C/D. PDF được mở ở tab mới để xem, in hoặc tải về; nếu trình duyệt chặn tab mới thì app tự tải file PDF xuống.


## Cập nhật bản Quét nhanh + AI theo khối + Đua vịt

- Máy quét QR điện thoại ưu tiên camera sau 1080p, continuous focus/zoom khi thiết bị hỗ trợ, BarcodeDetector native và jsQR đa tỉ lệ để tăng tốc và khả năng đọc QR nhỏ ở xa.
- AI tự nhận khối từ tên lớp chủ nhiệm (ví dụ LỚP 3B → Lớp 3), ưu tiên Gemini 3.5 Flash-Lite để phản hồi nhanh; dữ liệu đầu ra được kiểm tra chặt và tự fallback sang model mạnh hơn nếu kết quả không hợp lệ.
- Vòng quay có thêm tab **Đua vịt** để gọi tên học sinh ngẫu nhiên.
- Giao diện được làm tươi sáng hơn bằng CSS, không thay cấu trúc dữ liệu/chức năng hiện có.

## Cập nhật Đua Vịt

- Tất cả học sinh đứng cùng một **vạch XUẤT PHÁT** ở đầu bản đồ.
- Vạch **ĐÍCH** được đưa về gần cuối bản đồ (khoảng 90% chiều rộng sân đua).
- Khi lớp đông, kích thước vịt tự thu gọn để dễ quan sát hơn.
- Vịt thắng sẽ cán qua vạch đích; các vịt còn lại dừng trước vạch để xếp hạng.



## Cập nhật: Thư viện câu hỏi cho 3 trò chơi
- Quizz Nghiêng Đầu, Quét Thẻ QR và Ngón Tay Thần Kỳ có Thư viện câu hỏi riêng.
- Câu hỏi do Gemini AI tạo được đưa vào Thư viện trước; giáo viên tích chọn rồi mới đưa vào bộ câu hỏi thi đấu.
- Mỗi thư viện có Chọn tất cả, Bỏ chọn, Xóa từng câu và Xóa tất cả.
- Quản lí Học sinh có nút Xóa tất cả học sinh với bước xác nhận.

## Tối ưu quét QR trên điện thoại (19/08/2026)

- Ưu tiên camera sau độ phân giải cao và lấy nét liên tục khi thiết bị hỗ trợ.
- Không ép zoom để giữ vùng nhìn rộng; máy quét xử lý toàn khung hình.
- Khi có `BarcodeDetector`, app nhận nhiều QR trong cùng một frame; `jsQR` được dùng trên các crop nhỏ/chồng lấn để xác định hướng A/B/C/D của thẻ 1-QR.
- Các vùng quét luân phiên bao phủ trái/phải/trên/dưới/toàn khung, giúp QR nhỏ hoặc nằm sát mép dễ được nhận hơn.
- Cơ chế xác nhận độc lập theo từng học sinh cho phép đưa camera lướt qua nhiều thẻ liên tục mà không phải chờ thẻ trước.
- Thẻ PDF mới in QR lớn hơn và dùng mức sửa lỗi M để tăng kích thước từng ô QR, hỗ trợ đọc xa tốt hơn trong điều kiện lớp học sáng rõ.

## Nâng cấp Quét thẻ QR cả lớp (2026-08-19)

- Camera điện thoại ưu tiên 1080p, fallback 720p và camera sau góc rộng 1x.
- Nếu trình duyệt có `BarcodeDetector`, app nhận nhiều QR trong cùng một khung hình.
- `jsQR` chạy theo lưới 4×3 chồng lấn và có thể tìm nhiều mã trong một ô bằng cách che mã đã đọc rồi quét tiếp.
- App ưu tiên học sinh chưa trả lời, xác nhận đáp án thích ứng 1–3 lần theo độ rõ của QR và xử lý kết quả theo lô để giảm giật.
- Trạng thái trên điện thoại hiển thị số học sinh đã ghi nhận / tổng sĩ số.

Để quét cả lớp tốt nhất: dùng thẻ PDF do app tạo, giữ QR phẳng, đủ sáng, không che góc mã, điện thoại nằm ngang và để toàn bộ học sinh trong khung hình. Khoảng cách tối đa phụ thuộc độ phân giải camera, kích thước QR in và ánh sáng thực tế.


## Quét QR true multi realtime (2026-08-19)

- Engine điện thoại dùng **ZXing-C++ WebAssembly (`zxing-wasm`)** để đọc **nhiều QR trong một frame**, `maxNumberOfSymbols: 64`.
- Mỗi lần decode xử lý **toàn bộ khung hình**; không giới hạn vùng giữa.
- Camera ưu tiên **1080p**, fallback **720p**, camera sau và continuous autofocus nếu thiết bị hỗ trợ.
- Kết quả của mỗi frame được chuẩn hóa thành `[{studentId, answer}, ...]` và lưu tại runtime để xử lý đồng thời nhiều học sinh.
- Kết quả cũ được giữ khi giáo viên lia camera; cùng học sinh không bị ghi trùng, nhưng đáp án mới được cập nhật sau khi xác nhận ổn định.
- Điện thoại gửi các đáp án mới theo **một batch WebSocket** (`scan_response_batch`) để giảm số message và giảm render trên máy tính.
- Khung nhận diện được vẽ trên từng QR đang thấy; bộ đếm vẫn hiển thị **Đã quét x/y học sinh**.
- `BarcodeDetector + jsQR` chỉ là đường fallback nếu WASM multi không tải được.


## Quiz Nghiêng Đầu - khóa khuôn mặt + vùng chết
- Khóa người chơi phía trước camera, không tự nhảy sang khuôn mặt phía sau.
- Lấy NEUTRAL nhiều frame; dùng DEAD_ZONE / ANSWER_THRESHOLD / HOLD_TIME.
- Chỉ nhận hướng khi chuyển động rõ và giữ ổn định 150-300ms.
- Sau mỗi đáp án phải trở lại NEUTRAL mới nhận động tác tiếp theo.
- Mất khuôn mặt ngắn vẫn giữ khóa/tracking.

## Cập nhật: Tổng hợp cộng/trừ điểm theo ngày
- Mục Tích điểm có thêm bảng tổng hợp bên cạnh công cụ cộng điểm.
- Chọn ngày để vừa ghi điểm mới vừa kiểm tra lịch sử của ngày đó.
- Có thể xóa lượt cộng/trừ nhập sai; hệ thống hoàn lại điểm và sao tương ứng.

## Sửa: Nhận xét → Đánh giá định kỳ môn học và hoạt động giáo dục → Nhập file đánh giá CSDL (28/10/2026)

- Nút **Nhập file đánh giá CSDL** mở chọn `.xlsx`, `.xls`; chọn lại cùng file vẫn hoạt động nhờ reset file input sau đọc hoặc lỗi.
- Có bộ xử lý chuyên biệt `periodic-evaluation/assets/csdl-import.js`. Hàm `importWorkbook()` chọn sheet phù hợp, dò dòng tiêu đề và mapping cột theo tên, bỏ dấu/chữ hoa/chữ thường; đọc điểm, mức đánh giá, mã nhận xét và nội dung nhận xét.
- Đối chiếu học sinh bằng **Mã định danh Bộ GD&ĐT** trước; chỉ đối chiếu họ tên + ngày sinh khi file không có mã. Cập nhật theo từng học sinh, không nhân bản các bản ghi đã có; dòng lỗi không làm dừng import.
- Cập nhật ngay React state; kết quả có bộ đếm học sinh cập nhật/không tìm thấy/dòng lỗi. Dữ liệu đánh giá lưu riêng bằng localStorage key `gvcn_periodic_csdl_v1`, phân chia theo khối, môn học, thời điểm; không ghi vào `chuyen_tau_data` hoặc Firebase và không thay đổi `state.students`.
- File `index.html` của ứng dụng chính chỉ thêm cầu nối `gvcnPeriodicGetSharedStudents` **chỉ đọc bản sao** học sinh để mô-đun đánh giá định kỳ đối chiếu; không cập nhật danh sách chung. Nếu mở mô-đun riêng, có thể đọc danh sách chung được lưu trong `chuyen_tau_data`. Nếu không có danh sách chung, dữ liệu Excel được giữ độc lập trong riêng mô-đun đánh giá.
- Khi bảng đang mở và người dùng sửa/xóa nhận xét trong mô-đun, thao tác cũng được lưu vào kho riêng. Không xóa đánh giá ngoài khối–môn–thời điểm đã chọn.
- Lưu ý: cơ chế lưu mới là **localStorage của trình duyệt đang thao tác**, chưa tự đồng bộ Firebase giữa các máy. Cần giữ dữ liệu trình duyệt để dùng lại.

## Cập nhật 30/10/2026 — Nhập KHDH tự động theo tháng (Nhận xét → Nhập đánh giá thường xuyên)

- Phần KHDH chỉ hiển thị cây **Chủ đề → Bài học** (mở rộng/thu gọn); không có checkbox chọn chủ đề, bài hoặc tiết.
- Tệp nguồn: `.xlsx`, `.xls`, `.csv`, `.docx`, `.pdf` (gồm PDF có lớp chữ hoặc PDF scan nếu Gemini API có thể đọc ảnh từng trang). Tệp `.doc` ở dạng RTF/HTML có thể được đọc; `.doc` nhị phân cần mở trong Word và lưu lại `.docx` để giữ chính xác bảng.
- Cấu trúc bài được lưu riêng trong `state.regularEvaluation.khdhDocuments` theo `schoolYear|grade|subjectId`; nội dung KHDH/nhận xét cũ trong `khdhMap` không bị xóa khi cập nhật phiên bản.
- Tháng được xác định ưu tiên theo ngày dạy/tiết cụ thể; nếu chỉ có tuần, hệ thống suy ra lịch từ dữ kiện ngày/tuần trong file hoặc “Ngày thứ Hai của tuần học 1” do giáo viên cấu hình (cũng hỗ trợ `state.settings.schoolCalendar.week1Start`). Tuần giao tháng không có ngày học cụ thể được gán theo đa số ngày học thứ Hai–thứ Sáu. Các bài hoàn toàn thiếu căn cứ thời gian được đánh dấu chưa xác định, không tự gán tháng.
- Tổng tiết chủ đề là tổng các bài thực sự được tính cho tháng đang xem. Khi bài kéo dài qua nhiều tháng nhưng file không cho phân bổ số tiết theo ngày, giao diện hiển thị “Chưa đủ dữ liệu số tiết”, không hiển thị 0 sai hoặc tự chia tiết.
- AI từng học sinh và AI toàn lớp lấy context trực tiếp từ **toàn bộ các bài lọc theo năm học–khối–môn–tháng**; không sử dụng danh sách checkbox.
- Không sửa hồ sơ học sinh chung, điểm số, nhập/xuất Excel, khóa nhận xét, các phân hệ khác.
- **Lưu ý về độ chính xác:** Không thể khẳng định phân loại chính xác theo tháng khi file gốc thiếu tuần/ngày hoặc có thông tin trái ngược. Hệ thống hiển thị cảnh báo và cho phép cấu hình lịch tuần 1; khi cần, hãy sử dụng file KHDH có ngày dạy/tuần cụ thể.
- Ba tệp thay đổi/thêm: `index.html`, `api/gemini.js`, `khdh-structured.js` (bộ chuẩn hóa cấu trúc/lịch độc lập).

---

## Cập nhật 07/11/2026 — Nhập KHDH: tự tính tuần từ thứ tự tiết

**Vị trí:** Nhận xét → Nhập đánh giá thường xuyên → Nhập KHDH.

- KHDH được đọc từ `.xlsx`, `.xls`, `.pdf`, `.docx` và `.doc` (Word 97–2003/OLE2, văn bản hoặc bảng có thể trích xuất). PDF scan dùng Gemini API; tài liệu hỏng/không thể trích xuất sẽ hiển thị lỗi, không ghi đè dữ liệu đã lưu.
- Tập trung toàn bộ định mức tiết/tuần ở `khdh-structured.js` (`PERIODS_PER_WEEK`). Trong app, `tinhoc` và `congnghe` là hai môn riêng; `amnhac` và `mithuat` cũng riêng. Định mức **ghép** Tin học–Công nghệ và Âm nhạc–Mĩ thuật không được chia tùy tiện cho từng phân môn: nếu file không ghi số tiết/tuần cụ thể, hiển thị thông báo thiếu căn cứ.
- Dữ liệu lưu theo **năm học + khối + môn**, mỗi bài có `periods`, `periodStart`, `periodEnd`, `weekStart`, `weekEnd`, `weekSource`, `startDate`, `endDate`, `months`, `sessions`, chủ đề, tên bài và trọng tâm có căn cứ.
- Thứ tự ưu tiên: ngày cụ thể → tuần ghi trong file → thứ tự tiết PPCT → số tiết tích lũy. Tính tuần `Math.ceil(periodNumber / periodsPerWeek)` theo định mức đúng khối và môn khi đủ căn cứ. Không tự gán tuần của chủ đề cho từng bài.
- Giáo viên thiết lập **Ngày bắt đầu Tuần 1 của năm học** bằng ngày thứ Hai khi file không có ngày thực hiện. Nếu không có mốc thời gian đáng tin cậy, bài được đánh dấu chưa xác định tháng và không bị gán bừa. Tuần giao tháng thiếu ngày học cụ thể có thể hiển thị ở cả hai tháng, kèm cảnh báo về độ chính xác và số tiết phân bổ.
- KHDH được hiển thị dạng cây Chủ đề → Bài học, không có checkbox. KHDH gửi AI chỉ gồm các bài xác định được thuộc **môn + khối + tháng đang chọn**. Điểm 2–10, nhận xét, danh sách học sinh, lịch sử, Excel và các phân hệ khác không bị sửa.
- Mỗi Sheet Excel được xử lý độc lập trong quá trình trích xuất bằng Gemini; không suy đoán Sheet không rõ tên thuộc môn hiện tại.

**Kiểm tra trước khi triển khai:** Sao lưu dữ liệu lớp trước khi thay mã nguồn. Sau triển khai, thử nhập một KHDH có bảng tiết PPCT và chuyển tháng/môn; kiểm tra thông báo về bài thiếu thời gian và kỳ tuần giao tháng. Kết quả kiểm thử trong thư mục phát triển không tương đương việc chạy thực tế trên Vercel/Gemini với tất cả các biểu mẫu KHDH.


## Cập nhật 07/11/2026 — Tên lớp, lời nhận xét và mã Excel

Trong **Nhận xét → Nhập đánh giá thường xuyên**:

- Có **Chọn lớp** và ô **Tên lớp (có thể sửa)**. Sửa tên, bấm **Lưu** hoặc Enter. Việc đổi tên đồng bộ cấu hình lớp và tên lớp tương ứng trên các hồ sơ hiện có, chuyển các khóa danh sách làm việc/ghi chú KHDH cũ nếu cần, không tạo lại học sinh hoặc xóa các bản đánh giá.
- AI từng học sinh, AI toàn lớp và nút tạo bổ sung cùng sử dụng kiểm tra hô ngữ/đại từ trong **toàn bộ** câu. Các lời nhận xét chưa hợp lệ được thử tạo lại trước khi ghi. Lời nhận xét đang khóa không bị thay thế.
- Nút **Chuẩn hóa lời nhận xét** dùng Gemini để viết lại **chỉ những lời nhận xét hiện có không đạt quy tắc**, trong môn/tháng đang chọn; các ô khóa không bị sửa. AI được yêu cầu giữ nguyên ý nghĩa của lời cũ. Nếu không tạo được kết quả hợp lệ, giữ nguyên lời cũ và thông báo số lượng cần kiểm tra.
- **Xuất Excel** chỉ tạo Sheet môn có nội dung nhận xét, không xuất Giới tính/Tổ. Mã nhận xét được tính tại thời điểm xuất bằng `generateEvaluationCode({type,subjectId,month,score,className,studentIndex})`:
  - Môn học: `TX` + mã môn + `T` + tháng + mức + lớp + STT
  - Năng lực chung: `TXNLC` + phần sau tương tự
  - Năng lực đặc thù: `TXNLDT` + phần sau tương tự
  - Phẩm chất chủ yếu: `TXPCCY` + phần sau tương tự
  - Điểm **7–10 → T**, **5–6 → D**, **2–4 → C**; không có điểm → mã để trống.
- Bảng mã môn tập trung trong `REGULAR_EVAL_SUBJECT_CODE` ở `index.html`. **Điểm nội bộ luôn là `number | null`**, không bị ghi đè thành mã.

**Lưu ý:** Hãy sao lưu dữ liệu trước khi cập nhật ứng dụng trên GitHub/Vercel. Việc bấm Chuẩn hóa lời nhận xét sử dụng Gemini API và có thể phát sinh lượt gọi API; chức năng sẽ yêu cầu xác nhận trước khi chạy.

## Cập nhật 07/11/2026 — Nhập/Xuất KHDH dạng JSON

**Vị trí:** Nhận xét → Nhập đánh giá thường xuyên → Nhập KHDH.

- Chấp nhận thêm `.json` ngoài các tệp `.pdf`, `.doc`, `.docx`, `.xls`, `.xlsx` và `.csv` đang hỗ trợ. Tệp JSON được xử lý cục bộ bằng `JSON.parse` và `KHDHJson.validateKHDHJson`, không gọi Gemini để trích xuất tài liệu. PDF/Word/Excel vẫn giữ luồng xử lý trước đó.
- JSON của một môn: `{ "schoolYear":"2026-2027", "grade":3, "subjectId":"tieng-viet", "topics":[{"topicName":"Tên chủ đề", "lessons":[{"lessonName":"Tên bài", "periods":3, "periodStart":1, "periodEnd":3}]}] }`.
- JSON của nhiều môn: dùng `{ "schoolYear":"2026-2027", "grade":3, "subjects":[{ "subjectId":"tieng-viet", "topics":[...] }, { "subjectId":"toan", "topics":[...] }] }`. Mỗi môn có thể có `grade` hoặc `schoolYear` riêng, nếu thiếu thì kế thừa từ đối tượng gốc. **JSON phải khai báo khối và môn; ứng dụng không tự gán khối/môn hiện hành cho một JSON thiếu dữ liệu.**
- Có thể dùng `subject` (tên môn) hoặc `subjectId` (mã môn), chuẩn hóa dấu và chữ hoa/thường về ID thực của ứng dụng: `tiengviet`, `toan`, `tnxh`, `lichsuvadiali`, `khoahoc`, `ngoaingu`, `daoduc`, `hdtg`, `gdtc`, `tinhoc`, `congnghe`, `amnhac`, `mithuat`. Phân môn ghép không được tự chia số tiết khi tài liệu thiếu căn cứ.
- Mỗi bài phải có `lessonName` và **`periods` hợp lệ hoặc cặp `periodStart`/`periodEnd` hợp lệ**. Tùy chọn: `lessonNumber`, `weekStart`, `weekEnd`, `startDate`, `endDate`, `month`, `months`, `weeklyPeriods`, `sessions`, `focus`. Các số tiết/tuần phải nguyên dương; ngày dùng `YYYY-MM-DD`. Các dữ liệu mâu thuẫn hoặc thiếu không được tự đoán; lỗi được thông báo trước khi ghi.
- Mốc ngày thực tế ưu tiên khi xác định tháng; nếu không có ngày, dùng tháng đã ghi trong JSON; nếu chưa có tháng, suy từ tuần hoặc thứ tự tiết với cấu hình định mức/lịch tuần 1 có sẵn. Không phân loại sai các tuần giao tháng: giữ bài ở các tháng liên quan nếu thiếu ngày cụ thể.
- KHDH đã chuẩn hóa được lưu theo **năm học | khối | môn** trong `state.regularEvaluation.khdhDocuments`. Bấm chọn tháng/môn trên màn hình để tự lọc; AI chỉ lấy nội dung đúng tháng/môn qua `regularEvalKhdhContext()`.
- Nút **Xuất KHDH JSON** xuất riêng nội dung KHDH có cấu trúc của khối + môn đang chọn, có thể nhập lại. Những bài không có đủ số tiết/thứ tự tiết sẽ được cảnh báo khi xuất để tránh tạo JSON giả hợp lệ.
- Tệp JSON sai cấu trúc không được ghi đè KHDH cũ; khi nhập lại cùng dữ liệu không tạo bài trùng; khi thêm KHDH giai đoạn mới vẫn giữ bài đã lưu. Không thay đổi hồ sơ học sinh, điểm 2–10, AI nhận xét, nhập/xuất Excel và các module khác.
- Tệp thử: `examples/Mau_KHDH_JSON_Lop3_NhieuMon.json` (dữ liệu **giả lập**, không phải KHDH của trường). Cần thiết lập **Ngày bắt đầu Tuần 1** phù hợp năm học để tự tính tháng khi JSON chỉ có số tiết/tuần.

**Lưu ý triển khai:** Cập nhật đồng thời `index.html`, `khdh-structured.js` và tệp mới `khdh-json.js` lên GitHub/Vercel. Sao lưu dữ liệu lớp trước khi cập nhật. Bộ kiểm thử logic mô phỏng không thay thế kiểm thử trình duyệt và dữ liệu KHDH thật.

## Bổ sung 07/11/2026 — Chuẩn hóa lời nhận xét AI theo KHDH

Phạm vi: **Nhận xét → Nhập đánh giá thường xuyên**. Đã cập nhật quy tắc cho Gemini ở cả API `/api/gemini` và nhánh gọi trực tiếp dự phòng. Câu AI tối đa 250 ký tự, không có hô ngữ/đại từ xưng hô hoặc tên học sinh, không lộ điểm/KHDH/tên môn lớp. Câu phải nêu hành động/kỹ năng cùng kiến thức cụ thể được học và giữ giọng văn hoàn thành–khích lệ phù hợp mức điểm riêng 2–10.

Bộ `validateGeneratedComment` bổ sung phát hiện mẫu nhận xét chung chung và **kiểm tra từ khóa nội dung dựa trên các bài học thuộc môn và tháng đang chọn**. Đây là bước kiểm tra tự động giúp yêu cầu Gemini viết lại câu chưa đủ cụ thể; việc đối chiếu từ khóa không thể thay thế hoàn toàn giáo viên đánh giá đúng/sai về chuyên môn hay cách diễn đạt. Khi một câu lỗi, luồng AI chỉ yêu cầu viết lại câu đó, tối đa 3 lượt; câu chưa đạt không được lưu tự động. Các nhận xét đang khóa vẫn được giữ nguyên; dữ liệu điểm, hồ sơ, lịch sử và KHDH không bị sửa cấu trúc. Khi giáo viên đổi lớp/môn/tháng trong lúc AI đang chạy, kết quả cũ được bỏ qua để tránh dùng sai giai đoạn.

**Kiểm thử:** kiểm tra cú pháp JavaScript và API Gemini, 20 ca mẫu về hô ngữ, tính cụ thể/KHDH, điểm lộ, giới hạn 250 ký tự, câu đúng và câu sai; kiểm thử mô phỏng Gemini sinh bốn nhóm với một nhóm sai và chỉ viết lại nhóm đó. **Chưa thử API Gemini thật hoặc toàn bộ giao diện khi triển khai Vercel.**


## Bổ sung chống trùng nhận xét (07/11/2026)

- AI tạo nhận xét theo hai ý: ghi nhận kiến thức/kỹ năng đã đạt từ KHDH đúng tháng; góp ý nhẹ nhàng để rèn tiếp (điểm 2–8) hoặc duy trì/phát huy đúng kỹ năng (điểm 9–10). Không suy đoán lỗi cụ thể từ riêng điểm số.
- Trước khi lưu, kiểm tra câu trùng hoặc gần giống (chỉ thay 1–2 từ) giữa bốn nhóm, học sinh trong cùng lớp/môn/tháng; so với tháng khác của cùng học sinh và môn. Từng nhóm chưa đạt được Gemini viết lại riêng, tối đa 3 lượt.
- Nút “Chuẩn hóa lời nhận xét” có thể xử lý nhận xét cũ bị trùng hoặc sai cấu trúc; không ghi đè ô đã khóa. Không tự đổi nội dung đã lưu mà chưa được người dùng xác nhận.
- Lưu ý: bộ kiểm tra trùng và liên hệ KHDH dùng so khớp văn bản; giáo viên cần rà soát độ chính xác chuyên môn, nhất là các KHDH thiếu tên bài/trọng tâm.

## Cập nhật 08/11/2026 — Tối ưu AI và mã xuất Excel

### Tạo nhận xét theo batch
- Phân hệ **Nhận xét → Nhập đánh giá thường xuyên** tạo cache KHDH rút gọn theo **năm học + khối + môn + tháng**. Cache tự kiểm tra sự thay đổi danh sách bài và lịch tuần 1.
- **AI toàn lớp** gửi tối đa **5 học sinh trong một batch**, chạy tối đa **2 batch đồng thời** (có thể phụ thuộc giới hạn Gemini). Có action API Vercel mới `regular-evaluation-batch` trong `api/gemini.js`; chế độ Gemini trực tiếp cũng hỗ trợ action này.
- Mỗi học sinh truyền `studentId`, điểm riêng từng nhóm (dạng `x/10` chỉ trong prompt), nhận xét tháng trước an toàn và danh sách nhóm cần tạo. Không gửi tên học sinh trong dữ liệu batch.
- Kết quả của từng nhóm vẫn qua bộ kiểm tra độ dài 250 ký tự, KHDH tháng, hô ngữ, cấu trúc hai vế và trùng/gần trùng. Chỉ các nhóm còn lỗi được tạo lại theo luồng cá nhân; không ghi đè nhận xét đang khóa.
- **File Excel nhận xét tham khảo không được đóng gói, không được import vào dữ liệu app hoặc lưu làm commentBank/sampleComments.** Chỉ sử dụng hướng dẫn phong cách tổng quát trong `COMMENT_STYLE_GUIDE`.

### Mã nhận xét khi Xuất Excel
- Bổ sung `scoreToExportCode()` và `generateEvaluationExportCode()` tập trung.
- Chuyển điểm thành mã chỉ lúc xuất: **9–10 = T, 5–8 = D, 2–4 = C**, không có điểm = để trống. Điểm nội bộ vẫn là số nguyên 2–10 hoặc null.
- Đọc đúng các điểm số hiện hành (ưu tiên các trường `monHocScore/nlcScore/nldtScore/pcScore` nếu có, sau đó đến trường `*_ma` số), không lấy mức chữ/mã cũ.
- Ghi mã trực tiếp vào worksheet tại cột **F, H, J, L** ở mỗi Sheet xuất; trước khi ghi tệp có kiểm tra lại giá trị ô.
- Chỉ xuất Sheet môn có nội dung nhận xét, không xuất Giới tính/Tổ.

### Kiểm thử đã thực hiện
- Kiểm tra cú pháp script giao diện và `api/gemini.js`.
- Kiểm tra các mã theo những tình huống điểm, lớp, môn, tháng, STT; kiểm thử hàm xuất thực tế bằng mock XLSX, chuyển dữ liệu thu được thành workbook `.xlsx` và đọc kiểm tra lại các mã trên workbook.
- Kiểm thử giả lập 13 học sinh -> 3 batch, tối đa 2 batch đồng thời; chỉ 1 ô lỗi được gửi tạo lại. Kiểm tra API batch và cache KHDH đổi tháng.
- **Chưa gọi Gemini API thật hoặc kiểm thử trình duyệt Vercel trên dữ liệu học sinh thật.** Sao lưu dữ liệu trước khi triển khai, cập nhật đồng thời `index.html` và `api/gemini.js`.

## Bổ sung 08/11/2026 – Xuất bảng khai báo đánh giá thường xuyên

- **Vị trí nút:** Nhận xét → Nhập đánh giá thường xuyên → **AI toàn lớp | Xuất bảng khai báo | Xuất Excel**.
- **File mẫu thật** (do giáo viên cung cấp): `assets/mau-bang-khai-bao.xls`, gồm `Sheet1` và `HUONG_DAN`.
- **Cấu trúc Sheet1 bắt buộc:** `STT | Loại nhận xét | Mã nhận xét | Nội dung | Thứ tự hiển thị`; không thêm cột ngoài mẫu. Sheet hướng dẫn được giữ lại.
- File mẫu gốc sắp theo **nhóm loại nhận xét**. Bản xuất giữ trình tự `Môn học/Hoạt động giáo dục → Năng lực chung → Năng lực đặc thù → Phẩm chất chủ yếu`. Trong mỗi loại, các môn có nhận xét được xuất theo thứ tự môn đã cấu hình; **học sinh luôn giữ nguyên STT đang hiển thị trên bảng lớp**. STT A/E của Sheet1 là số thứ tự dòng khai báo tăng dần; STT học sinh nằm ở phần cuối mã nhận xét.
- Bảng khai báo không tạo một bản sao dữ liệu học sinh/điểm/nhận xét trong LocalStorage. `regularEvalBuildDeclarationRows()` lấy trực tiếp evaluations theo năm học, khối, lớp, tháng, môn và `studentId`; mọi lần tải đều đọc lại nội dung mới nhất.
- Sau AI toàn lớp, AI từng học sinh, Nhập File mẫu hoặc sửa thủ công, `regularEvalSyncDeclaration()` cập nhật thông tin số dòng trong bộ nhớ tạm. Không cần làm lại AI để xuất.
- Hai chức năng xuất dùng chung `generateEvaluationExportCode()` và `regularEvalExportScore()`: 9–10=T, 5–8=D, 2–4=C; `null` để trống mã. Đặc biệt ưu tiên ô `*_ma` đang hiển thị trên giao diện so với các trường điểm lịch sử.
- Nếu một mục chưa có điểm/nhận xét thì cảnh báo trước khi xuất và cho phép xuất phần đã có; nếu có nhận xét >250 ký tự thì chặn xuất để giáo viên sửa, không tự cắt nội dung.
- Tên file: `Bang_Khai_Bao_Thuong_Xuyen_Lop3B_Thang10.xlsx` (theo lớp, tháng đang chọn).
- **Lưu ý định dạng:** SheetJS nhận mẫu `.xls` nguyên gốc với `cellStyles:true` và xuất `.xlsx`; cấu trúc hai Sheet, tên cột, thứ tự cột và độ rộng được giữ theo khả năng của SheetJS. Một số định dạng BIFF cũ như đường viền/phông chữ có thể không được chuyển đổi 1:1 trong bản `.xlsx` mới.
- Không động đến mã nguồn API Gemini, KHDH, học sinh chung, điểm danh hay các trò chơi.

**Tệp kiểm thử:** `Bang_Khai_Bao_KIEM_THU_Lop3B_Thang10.xlsx` được tạo riêng bên ngoài gói mã nguồn; dữ liệu trong file chỉ là giả lập, không nhập vào lớp thật.

## Cập nhật 08/11/2026 — Đồng bộ mã trong Xuất Excel / Bảng khai báo

- `generateEvaluationExportCode()` là hàm sinh mã duy nhất, với điểm 9–10 → T, 5–8 → D, 2–4 → C; trường trống → mã trống.
- `buildEvaluationExportRows()` là nguồn dữ liệu trung gian duy nhất. Cả `regularEvalExportExcel()` và `regularEvalBuildDeclarationRows()` (dùng bởi `regularEvalExportDeclaration()`) đều đọc mã và nội dung từ các dòng này; không tái tạo mã ở Bảng khai báo.
- Bốn trường `monHocScore`, `nlcScore`, `nldtScore`, `pcScore` được hỗ trợ. Để giữ tương thích với các bản GVCN hiện có, điểm số hợp lệ `number` trong các ô dropdown `*_ma` vẫn được đọc như **điểm số**, không bao giờ như mã xuất. Việc giáo viên thay điểm qua dropdown hoặc nhập Excel đồng bộ thêm vào `*Score`.
- Mỗi bản ghi được tra cứu theo `studentId + schoolYear + subjectId + month`; STT lấy theo thứ tự học sinh đang hiển thị. Bảng khai báo giữ nguyên template `.xls` và cấu trúc 5 cột hiện tại, chỉ xuất môn có nội dung của tháng đã chọn.
- Nếu có điểm mà thiếu mã do cấu hình môn/lớp/STT không hợp lệ, ứng dụng báo lỗi rõ ràng và không âm thầm xuất cột mã trống. Những ô thật sự chưa chọn điểm vẫn để trống.
- Kiểm thử kèm ngoài ZIP ứng dụng: 3 học sinh mô phỏng × 2 môn × 4 loại = 24 cặp mã–nội dung đã đối chiếu giữa hai file `.xlsx` được tạo, đọc lại thành công. Chưa kiểm thử qua browser/Vercel với dữ liệu thực tế.

## Bản vá 08/11/2026 – Lỗi không xuất được Excel/Bảng khai báo

- Sửa lỗi khâu sinh mã nhận xét: khi cấu hình **Tên lớp** chưa hợp lệ hoặc bị lưu trống, trước đây `generateEvaluationExportCode()` trả `""` cho mọi học sinh mà không thông báo tham số lỗi. Hai chức năng Xuất Excel/Bảng khai báo đều bị chặn trước lúc tải, dù điểm 2–10 vẫn hợp lệ.
- Tên lớp xuất được ưu tiên lấy từ cấu hình đã chọn; nếu chưa hợp lệ thì tự kiểm tra lớp trên danh sách học sinh hiện tại, sau đó tới cấu hình chung, và chỉ sử dụng nếu xác định được **duy nhất một lớp**. Tuyệt đối không tạo lớp giả. Tên lớp trong dữ liệu thật không bị sửa bởi quá trình xuất.
- Chuẩn hóa các tên lớp như `3B`, `3 B`, `Lớp 3B`, `2A1`; nhận mã lớp đầy đủ, không lẫn tiền tố/trường/năm học.
- Nếu chưa xác định được lớp, thông báo **chính xác cần chọn/lưu Tên lớp** trong thanh cấu hình, không hiển thị hàng chục lỗi giống nhau. Các lỗi khác hiển thị thông tin thành phần cần kiểm tra (môn, tháng, STT, điểm).
- Giữ một nguồn sinh mã và dòng dữ liệu chung cho hai chức năng xuất; không tác động tới điểm số hoặc nhận xét đã lưu, KHDH, AI, Nhập File mẫu.
- Kiểm thử: 24/24 cặp mã + nội dung giữa hai file XLSX khớp sau khi tạo và đọc lại; kiểm thử lớp trống, lớp mặc định `LỚP HỌC`, tự tìm lớp từ hồ sơ, lớp `3B` và lỗi lớp không thể xác định; cú pháp JavaScript đạt.

**Sau khi triển khai:** vào `Nhận xét → Nhập đánh giá thường xuyên`, kiểm tra ô **Tên lớp (có thể sửa)** phải có mã thực như `3B` hoặc `2A1`. Nếu chưa có, nhập tên lớp và nhấn **Lưu**, sau đó thử **Xuất Excel** và **Xuất bảng khai báo**. Không cần chạy lại AI và không cần nhập lại điểm.

*Chưa kiểm thử với dữ liệu LocalStorage thực của trình duyệt/Vercel của giáo viên. Khi mã vẫn không hợp lệ, bản vá sẽ báo rõ nguyên nhân thay vì chỉ xuất hiện các lỗi giống nhau cho từng học sinh.*


## TÍCH HỢP 3 PHÂN HỆ VÀO MỘT index.html (11/2026)

Ba ứng dụng đánh giá định kỳ môn học/HĐGD, đánh giá năng lực/phẩm chất và nhận xét học bạ đã được đóng gói toàn bộ mã JavaScript, CSS và HTML vào `index.html` chính. Không cần ba thư mục `periodic-evaluation/`, `competency-quality-evaluation/`, `report-card-comments/` khi triển khai.

Kiến trúc: `index.html` chứa ba tài liệu ứng dụng dưới dạng dữ liệu JSON trơ. Khi mở một mục, app gắn tài liệu vào một `iframe srcdoc` **nội bộ, không tải một trang HTML phụ**. Đây là ranh giới để tránh xung đột React, stylesheet và `document`. React của từng phân hệ chỉ khởi động khi mục đó được mở. Do dùng cùng origin, localStorage cũ vẫn dùng được. Phần quản lý học sinh chính không bị viết lại. Đánh giá định kỳ đọc bản sao danh sách học sinh qua parent khi cần, không sửa nguồn hồ sơ chung.

**Quan trọng:** Đây là tích hợp mã vào **một tệp HTML chính**, không phải viết lại ba ứng dụng React thành một React tree duy nhất. Các thư viện CDN mà ứng dụng gốc dùng (Tailwind, Gemini, v.v.) vẫn cần truy cập Internet. Đặc biệt mã React đã biên dịch nên cần kiểm thử thao tác thật trên domain triển khai; kiểm thử tĩnh không thay thế kiểm thử trình duyệt.
