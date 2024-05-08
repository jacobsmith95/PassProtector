var input_fields = document.getElementsByTagName("input")

var username_field;
var password_field; 

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        
        if (!username_field && !password_field) {
            for (var idx=0; idx<input_fields.length; idx++) {
                if (input_fields[idx].type == "password") {
                    username_field = input_fields[idx-1];
                    password_field = input_fields[idx];
                }
            }
        }

        username_field.value = request.username
        username_field.dispatchEvent(new Event('change', { bubbles: true }));
        password_field.value = request.password
        password_field.dispatchEvent(new Event('change', { bubbles: true }));
    }
);
