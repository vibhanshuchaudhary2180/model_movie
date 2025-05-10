(function () {
    'use strict'
    
    // Fetch all forms that need validation
    const forms = document.querySelectorAll('.validated-form')
    
    // Loop over each form and prevent submission if validation fails
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault()
                event.stopPropagation()
            }
            
            form.classList.add('was-validated')
        }, false)
    })
})()