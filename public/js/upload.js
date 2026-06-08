(function() {
    // Validation and interactivity for the upload form
    const uploadForm = document.querySelector(".upload-form");
    const fileInput = document.getElementById("document");
    const errorMessage = document.getElementById("file-error");
    const selectedFile = document.getElementById("selected-file");
    const uploadButton = document.getElementById("upload-btn");

    // File validation rules
    const MAX_FILE_SIZE = 5 * 1024 * 1024;

    const ALLOWED_TYPES = [
        "application/pdf",
        "image/png",
        "image/jpeg",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];

    // Validatation of file
    function validateFile(file) {
        if (!file) return "Please select a file.";
        if (!ALLOWED_TYPES.includes(file.type)) return `Unsupported file type. Only PDF, PNG,\
            JPG, DOC, DOCX files are allowed.`.trim();
        if (file.size > MAX_FILE_SIZE) return `File too large. Maximum file size is 5MB.`.trim();
        return null;
    }

    fileInput.addEventListener("change", () => {

            const file = fileInput.files[0];
            if (!file) {
                selectedFile.textContent = "No file selected";
                errorMessage.textContent = "";
                uploadButton.disabled = true;
                return;
            }

            selectedFile.textContent = `Selected: ${file.name}`;

            const error = validateFile(file);
            if (error) {
                errorMessage.textContent = error;
                uploadButton.disabled = true;
                return;
            }

            errorMessage.textContent = "";
            uploadButton.disabled = false;
        }
    );

    uploadForm.addEventListener("submit", (event) => {
            const file = fileInput.files[0];
            const error = validateFile(file);

            if (error) {
                event.preventDefault();
                errorMessage.textContent = error;
            }
        }
    );

    uploadButton.disabled = true;
})();