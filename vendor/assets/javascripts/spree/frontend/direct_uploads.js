$(document).ready(function() {

  if (document.getElementById("card_preview_container"))
  {
    // addEventListener("direct-upload:initialize", event => {
    //   console.log("direct-upload:initialize");
    //   const { target, detail } = event
    //   const { id, file } = detail
    //   target.insertAdjacentHTML("beforebegin", `
    //     <div id="direct-upload-${id}" class="direct-upload direct-upload--pending">
    //       <div id="direct-upload-progress-${id}" class="direct-upload__progress" style="width: 0%"></div>
    //       <span class="direct-upload__filename">${file.name}</span>
    //     </div>
    //   `)
    // })
    
    // addEventListener("direct-upload:start", event => {
    //   console.log("direct-upload:start");
    //   const { id } = event.detail
    //   const element = document.getElementById(`direct-upload-${id}`)
    //   element.classList.remove("direct-upload--pending")
    // })
    
    // addEventListener("direct-upload:progress", event => {
    //   console.log("direct-upload:progress");
    //   const { id, progress } = event.detail
    //   const progressElement = document.getElementById(`direct-upload-progress-${id}`)
    //   progressElement.style.width = `${progress}%`
    // })
    
    // addEventListener("direct-upload:error", event => {
    //   console.log("direct-upload:error");
    //   event.preventDefault()
    //   const { id, error } = event.detail
    //   const element = document.getElementById(`direct-upload-${id}`)
    //   element.classList.add("direct-upload--error")
    //   element.setAttribute("title", error)
    // })
    
    // addEventListener("direct-upload:end", event => {
    //   const { id } = event.detail
    //   const element = document.getElementById(`direct-upload-${id}`)
    //   element.classList.add("direct-upload--complete")
    // })


    const input = document.querySelector('input[type=file]')
    
    // Bind to file drop - use the ondrop on a parent element or use a
    //  library like Dropzone
    const onDrop = (event) => {
      event.preventDefault()
      const files = event.dataTransfer.files;
      Array.from(files).forEach(file => uploadFile(file))
    }
    
    // Bind to normal file selection
    input.addEventListener('change', (event) => {
      // Array.from(input.files).forEach(file => uploadFile(file))
      // you might clear the selected files from the input
      // input.value = null
      var file = event.target.files[0];
      maxImgSize = 10000000;
      maxFilesAllowed = 4;
      var formData = new FormData();
      formData.append('blob', file);
      if (($('.uploaded-images').length < maxFilesAllowed) && (file.size <= maxImgSize)) {
        $.ajax({
          url: $('#picupload').attr('action'),
          type: 'POST',
          processData: false,
          contentType: false,
          data: formData,
          success: function(response) {
            // alert("Succeeded");
          } ,
          error: function(error) {
            // alert("ERROR:");
          }
        })
      }
      else {
        if ($('.uploaded-images').length >= maxFilesAllowed) {
          errMsg = "You can upload upto 4 images only. You can delete existing images and then try adding new ones.";
          
        } else if (file.size >= maxImgSize) {
          errMsg = "Only files with sizes upto 10 MB can be uploaded. Please resize the image or select another image.";
        }
        invokeModalNotify("Image Upload Error", errMsg);
      }
        
      input.value = null;
    })
    
    // const uploadFile = (file) => {
    //   // your form needs the file_field direct_upload: true, which
    //   //  provides data-direct-upload-url
    //   // const url = input.dataset.directUploadUrl

    //   const url = $('#picupload').attr('action');
    //   const upload = new ActiveStorage.DirectUpload(file, url)
    
    //   upload.create((error, blob) => {
    //     if (error) {
    //       // Handle the error
    //     } else {
    //       // Add an appropriately-named hidden input to the form with a
    //       //  value of blob.signed_id so that the blob ids will be
    //       //  transmitted in the normal upload flow
    //       const hiddenField = document.createElement('input')
    //       hiddenField.setAttribute("type", "hidden");
    //       hiddenField.setAttribute("value", blob.signed_id);
    //       hiddenField.name = input.name
    //       document.querySelector('form').appendChild(hiddenField)
    //     }
    //   })
    // }
  }
});