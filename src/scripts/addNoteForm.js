export default class AddNoteForm extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.maxNotes = this.getAttribute('max-notes') || 25
  }

  connectedCallback() {
    this.renderForm()
    this.setupFormSubmission()
  }

  renderForm() {
    const form = document.createElement('form')
    form.innerHTML = `
            <label for="title">Title:</label><br>
            <input type="text" id="title" name="title" required minlength="0" maxlength="25"><br><br>
            <label for="body">Content of Notes:</label><br>
            <textarea id="body" name="body" rows="4" cols="50" required minlength="0" maxlength="500"></textarea><br><br>
            <button type="submit">Add New Note</button>
            <div id="error-message" style="color: red;"></div>
        `

    const style = document.createElement('style')
    style.textContent = `
            /* Validate error message */
            #error-message {
                margin-top: 10px;
                font-size: 14px;
            }
            form {
                max-width: 500px;
                margin: 20px auto;
                padding: 20px;
                background-color: #121212;
                border-radius: 8px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                border: 2px solid white;
            }
            
            label {
                display: block;
                margin-bottom: 5px;
                font-size: 16px;
                color: #fff;
            }
            
            input[type="text"],
            textarea {
                width: 100%;
                padding: 10px;
                margin-bottom: 15px;
                border: none;
                border-radius: 4px;
                background-color: #fff;
                color: #333;
                font-size: 16px;
            }
            
            textarea {
                resize: vertical;
                min-height: 100px;
            }
            
            button[type="submit"] {
                padding: 10px 20px;
                border: none;
                border-radius: 4px;
                background-color: #2c2c2e;
                color: #fff;
                font-size: 16px;
                cursor: pointer;
                transition: background-color 0.3s ease;
                box-shadow: 0 0 0 2px #fff;
            }
            
            button[type="submit"]:hover {
                background-color: #3e3e3e;
            }
            
            @media screen and (max-width: 768px) {
                form {
                    max-width: 90%;
                }
                
                input[type="text"],
                textarea {
                    width: calc(100% - 20px); 
                }
                
                button[type="submit"] {
                    font-size: 14px;
                    padding: 8px 16px; 
                }
            }
            
            @media screen and (max-width: 480px) {
                input[type="text"],
                textarea {
                    font-size: 14px; 
                }
                
                button[type="submit"] {
                    font-size: 12px; 
                    padding: 6px 12px; 
                }
            }            
            
        `

    this.shadowRoot.appendChild(style)
    this.shadowRoot.appendChild(form)
  }

  setupFormSubmission() {
    const form = this.shadowRoot.querySelector('form')
    const errorMessage = this.shadowRoot.getElementById('error-message')
    const titleInput = form.querySelector('#title')
    const bodyInput = form.querySelector('#body')

    form.addEventListener('submit', (event) => {
      event.preventDefault()
      if (form.checkValidity()) {
        const formData = new FormData(form)
        const title = formData.get('title')
        const body = formData.get('body')

        // Send POST request to create a new record
        fetch('https://notes-api.dicoding.dev/v2/notes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: title,
            body: body,
          }),
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error('Failed to create note')
            }
            return response.json()
          })
          .then((data) => {
            console.log('Note created successfully:', data)
            const eventToAddNote = new CustomEvent('newNoteAdded', {
              detail: { title, body },
            })
            document.dispatchEvent(eventToAddNote)
            form.reset() // Leave the form blank after submission
            errorMessage.textContent = '' // Delete error messages after delivery

            // Display alerts with SweetAlert2
            Swal.fire({
              icon: 'success',
              title: 'Note added successfully!',
              showConfirmButton: false,
              timer: 1500, // Alert duration is displayed in milliseconds
            })
          })
          .catch((error) => {
            console.error('Error creating note:', error)
            // Show error alert
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Failed to create note',
            })
          })
      } else {
        errorMessage.textContent = 'Please fill in both fields correctly.' // Displays an error message if validation fails
      }
    })

    // Validation when the user types
    titleInput.addEventListener('input', () => {
      if (!titleInput.validity.valid) {
        titleInput.setCustomValidity(
          'The title should be 0 to 25 characters long.',
        )
      } else {
        titleInput.setCustomValidity('')
      }
    })

    bodyInput.addEventListener('input', () => {
      if (!bodyInput.validity.valid) {
        bodyInput.setCustomValidity(
          'The content must be between 0 and 500 characters.',
        )
      } else {
        bodyInput.setCustomValidity('')
      }
    })
  }
}
customElements.define('add-note-form', AddNoteForm)
