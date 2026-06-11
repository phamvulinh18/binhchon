/**
 * Locket Gold Lucky Draw Backend - Google Apps Script
 * Link this script with your Google Sheet to store entries and prevent duplicate emails.
 */

function doPost(e) {
  // CORS configuration
  var headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };

  // Prevent concurrent write issues (thread safety)
  var lock = LockService.getScriptLock();
  try {
    // Try to acquire the lock for 10 seconds
    if (!lock.tryLock(10000)) {
      return createJsonResponse({
        status: "error",
        message: "Hệ thống đang quá tải, vui lòng thử lại sau vài giây."
      }, headers);
    }

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Auto-initialize headers if the sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Thời gian", "Họ và tên", "Gmail", "Số điện thoại Zalo", "Trạng thái mua hàng"]);
    }

    // Extract parameters from request
    var fullname = e.parameter.fullname;
    var email = e.parameter.email;
    var zalo = e.parameter.zalo;
    var status = e.parameter.status;

    // Server-side validation
    if (!fullname || !email || !zalo || !status) {
      return createJsonResponse({
        status: "error",
        message: "Thiếu thông tin bắt buộc. Vui lòng điền đầy đủ form."
      }, headers);
    }

    fullname = fullname.trim();
    email = email.trim().toLowerCase();
    zalo = zalo.trim();
    status = status.trim();

    // Check duplicate email
    var lastRow = sheet.getLastRow();
    var isDuplicate = false;

    if (lastRow > 1) {
      // Get all values in Column C (Gmail column) from row 2 to lastRow
      var emailRange = sheet.getRange(2, 3, lastRow - 1, 1);
      var emailValues = emailRange.getValues();

      for (var i = 0; i < emailValues.length; i++) {
        var existingEmail = emailValues[i][0].toString().trim().toLowerCase();
        if (existingEmail === email) {
          isDuplicate = true;
          break;
        }
      }
    }

    if (isDuplicate) {
      return createJsonResponse({
        status: "duplicate",
        message: "Gmail này đã đăng ký tham gia quay thưởng trước đó."
      }, headers);
    }

    // Append new record
    var currentTime = new Date();
    // Format date string for Google Sheets: dd/MM/yyyy HH:mm:ss
    var formattedTime = Utilities.formatDate(currentTime, Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm:ss");
    
    sheet.appendRow([formattedTime, fullname, email, zalo, status]);

    // Return success
    return createJsonResponse({
      status: "success",
      message: "Tham gia quay thưởng thành công!"
    }, headers);

  } catch (error) {
    // Return system error
    return createJsonResponse({
      status: "error",
      message: "Lỗi hệ thống: " + error.toString()
    }, headers);

  } finally {
    // Always release the lock
    lock.releaseLock();
  }
}

/**
 * Helper function to create JSON response
 */
function createJsonResponse(data, headers) {
  var output = ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
  
  // Apps Script automatically resolves CORS on the redirected URL,
  // but adding headers explicitly covers some edge cases and local testing.
  return output;
}

/**
 * Handle OPTIONS requests for local testing / preflights (optional but good practice)
 */
function doOptions(e) {
  var output = ContentService.createTextOutput("");
  return output;
}
