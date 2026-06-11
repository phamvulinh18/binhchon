/**
 * Locket Gold Lucky Draw - Client Script
 * Handles form validation, UI state management, and API calls to Google Sheets.
 */

// ⚠️ LINK WEB APP DEPLOY TỪ GOOGLE APPS SCRIPT
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwBmD_fzmrbWktHt-SK0_8MR_TlUPD1TiUdBud3fI5SdTIdmvHSPfGYSNTBgyLJGHtM/exec';

document.addEventListener('DOMContentLoaded', () => {
    // Form Elements
    const form = document.getElementById('luckyDrawForm');
    const fullnameInput = document.getElementById('fullname');
    const emailInput = document.getElementById('email');
    const zaloInput = document.getElementById('zalo');
    const statusSelect = document.getElementById('status');
    const submitBtn = document.getElementById('submitBtn');

    // Modal Elements
    const resultModal = document.getElementById('resultModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    const modalIconContainer = document.getElementById('modalIconContainer');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const closeModalCross = document.getElementById('closeModalCross');

    // Run deadline check (20:00 June 11, 2026 GMT+7)
    const checkDeadline = () => {
        const now = new Date();
        const deadline = new Date('2026-06-11T20:00:00+07:00');
        if (now >= deadline) {
            fullnameInput.disabled = true;
            emailInput.disabled = true;
            zaloInput.disabled = true;
            statusSelect.disabled = true;
            submitBtn.disabled = true;
            
            form.classList.add('hidden');
            
            // Insert expired banner
            if (!document.getElementById('expiredNotice')) {
                const notice = document.createElement('div');
                notice.id = 'expiredNotice';
                notice.className = 'expired-notice';
                notice.innerHTML = `
                    <div class="expired-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                    </div>
                    <h3>HẾT HẠN THAM GIA</h3>
                    <p>Chương trình quay thưởng đã kết thúc vào lúc <strong>20:00 ngày 11/06/2026</strong>. Hẹn gặp lại bạn ở các chương trình tiếp theo!</p>
                `;
                form.parentNode.insertBefore(notice, form);
            }
            return true;
        }
        return false;
    };

    // Check immediately on page load
    checkDeadline();

    // Validation Regex (Gmail check: name@gmail.com)
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;
    // Phone Regex: Starts with 0, followed by 9 digits (total 10 digits)
    const phoneRegex = /^0[1-9][0-9]{8}$/;

    /**
     * Show validation error for a form group
     */
    const showError = (inputElement, errorElementId, message) => {
        const formGroup = inputElement.closest('.form-group');
        formGroup.classList.add('has-error');
        document.getElementById(errorElementId).textContent = message;
    };

    /**
     * Clear validation error for a form group
     */
    const clearError = (inputElement) => {
        const formGroup = inputElement.closest('.form-group');
        formGroup.classList.remove('has-error');
    };

    // Auto-clear errors on input
    fullnameInput.addEventListener('input', () => clearError(fullnameInput));
    emailInput.addEventListener('input', () => clearError(emailInput));
    zaloInput.addEventListener('input', () => clearError(zaloInput));
    statusSelect.addEventListener('change', () => clearError(statusSelect));

    /**
     * Validate the entire form
     */
    const validateForm = () => {
        let isValid = true;

        // 1. Validate Fullname
        const fullnameVal = fullnameInput.value.trim();
        if (!fullnameVal) {
            showError(fullnameInput, 'fullnameError', 'Vui lòng nhập họ và tên của bạn.');
            isValid = false;
        } else if (fullnameVal.length < 2) {
            showError(fullnameInput, 'fullnameError', 'Họ và tên phải có ít nhất 2 ký tự.');
            isValid = false;
        } else {
            clearError(fullnameInput);
        }

        // 2. Validate Gmail
        const emailVal = emailInput.value.trim();
        if (!emailVal) {
            showError(emailInput, 'emailError', 'Vui lòng nhập địa chỉ Gmail.');
            isValid = false;
        } else if (!gmailRegex.test(emailVal)) {
            showError(emailInput, 'emailError', 'Email phải đúng định dạng Gmail (ví dụ: ten@gmail.com).');
            isValid = false;
        } else {
            clearError(emailInput);
        }

        // 3. Validate Zalo phone number
        const zaloVal = zaloInput.value.trim();
        if (!zaloVal) {
            showError(zaloInput, 'zaloError', 'Vui lòng nhập số điện thoại Zalo.');
            isValid = false;
        } else if (!phoneRegex.test(zaloVal)) {
            showError(zaloInput, 'zaloError', 'Số điện thoại Zalo không hợp lệ (phải gồm 10 chữ số và bắt đầu bằng số 0).');
            isValid = false;
        } else {
            clearError(zaloInput);
        }

        // 4. Validate Status
        const statusVal = statusSelect.value;
        if (!statusVal) {
            showError(statusSelect, 'statusError', 'Vui lòng chọn trạng thái mua hàng.');
            isValid = false;
        } else {
            clearError(statusSelect);
        }

        return isValid;
    };

    /**
     * Set loading state for form submission
     */
    const setLoading = (loading) => {
        if (loading) {
            submitBtn.classList.add('is-loading');
            fullnameInput.disabled = true;
            emailInput.disabled = true;
            zaloInput.disabled = true;
            statusSelect.disabled = true;
        } else {
            submitBtn.classList.remove('is-loading');
            fullnameInput.disabled = false;
            emailInput.disabled = false;
            zaloInput.disabled = false;
            statusSelect.disabled = false;
        }
    };

    /**
     * SVG Icons for Modal
     */
    const getSuccessIcon = () => `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
    `;

    const getErrorIcon = () => `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
    `;

    /**
     * Show Result Modal
     */
    const showModal = (type, title, message) => {
        // Reset styles
        const modalCard = resultModal.querySelector('.modal-card');
        modalCard.className = 'modal-card'; // Reset classes
        modalIconContainer.className = 'modal-icon-container';

        if (type === 'success') {
            modalCard.classList.add('success-theme');
            modalIconContainer.classList.add('success');
            modalIconContainer.innerHTML = getSuccessIcon();
        } else {
            modalCard.classList.add('error-theme');
            modalIconContainer.classList.add('error');
            modalIconContainer.innerHTML = getErrorIcon();
        }

        modalTitle.textContent = title;
        modalMessage.innerHTML = message;
        
        resultModal.classList.remove('hidden');
        // Small delay to trigger CSS transition
        setTimeout(() => {
            resultModal.classList.add('show');
        }, 10);
    };

    /**
     * Hide Result Modal
     */
    const hideModal = () => {
        resultModal.classList.remove('show');
        setTimeout(() => {
            resultModal.classList.add('hidden');
        }, 400); // Matches the transition duration in CSS
    };

    // Close Modal Events
    closeModalBtn.addEventListener('click', hideModal);
    closeModalCross.addEventListener('click', hideModal);
    resultModal.addEventListener('click', (e) => {
        if (e.target === resultModal) {
            hideModal();
        }
    });

    /**
     * Form Submission handler
     */
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Check deadline again before processing
        if (checkDeadline()) {
            return;
        }

        // Run validation
        if (!validateForm()) {
            return;
        }

        // Check if URL is configured
        if (SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL') {
            showModal('error', 'Cấu hình chưa hoàn tất', 'Vui lòng thay thế <code>SCRIPT_URL</code> trong file <code>script.js</code> bằng link Web App Google Apps Script của bạn trước khi thử nghiệm.');
            return;
        }

        setLoading(true);

        const fullname = fullnameInput.value.trim();
        const email = emailInput.value.trim();
        const zalo = zaloInput.value.trim();
        const status = statusSelect.value;

        // Encode parameters as form-urlencoded to prevent CORS preflight OPTIONS request issues
        const requestParams = new URLSearchParams();
        requestParams.append('fullname', fullname);
        requestParams.append('email', email);
        requestParams.append('zalo', zalo);
        requestParams.append('status', status);

        try {
            const response = await fetch(SCRIPT_URL, {
                method: 'POST',
                body: requestParams,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            if (!response.ok) {
                throw new Error(`Server returned HTTP ${response.status}`);
            }

            const data = await response.json();

            if (data.status === 'success') {
                showModal(
                    'success',
                    'Đăng ký thành công!',
                    `Chúc mừng <strong>${fullname}</strong> đã đăng ký tham gia quay thưởng thành công. Hãy chuẩn bị tinh thần nhận quà nhé! 🎉`
                );
                form.reset(); // Clear the form fields
            } else if (data.status === 'duplicate') {
                showModal(
                    'error',
                    'Gmail đã được sử dụng',
                    `Địa chỉ Gmail <strong>${email}</strong> đã đăng ký tham gia quay thưởng trước đó. Mỗi email chỉ được tham gia 1 lần.`
                );
            } else {
                showModal(
                    'error',
                    'Đã xảy ra lỗi',
                    data.message || 'Hệ thống đang gặp sự cố. Vui lòng thử lại sau.'
                );
            }
        } catch (error) {
            console.error('Request failed:', error);
            showModal(
                'error',
                'Kết nối thất bại',
                'Không thể kết nối đến máy chủ Google Sheets. Vui lòng kiểm tra lại kết nối mạng hoặc cấu hình Web App.'
            );
        } finally {
            setLoading(false);
        }
    });
});
