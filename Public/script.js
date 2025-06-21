document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const form = document.getElementById('registroForm');
    const nombreInput = document.getElementById('nombre');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const usersTable = document.querySelector('#usersTable tbody');
    
    // Toggle visibilidad de contraseña
    document.querySelectorAll('.toggle-password').forEach(button => {
        button.addEventListener('click', function() {
            const input = this.previousElementSibling;
            if (input.type === 'password') {
                input.type = 'text';
                this.textContent = '🙈';
            } else {
                input.type = 'password';
                this.textContent = '👁️';
            }
        });
    });
    
    // Validación en tiempo real
    nombreInput.addEventListener('input', validateNombre);
    emailInput.addEventListener('input', validateEmail);
    passwordInput.addEventListener('input', validatePassword);
    confirmPasswordInput.addEventListener('input', validateConfirmPassword);
    
    // Envío del formulario
    form.addEventListener('submit', handleSubmit);
    
    // Cargar datos iniciales
    loadUsers();
    
    // Funciones de validación
    function validateNombre() {
        const errorElement = document.getElementById('nombreError');
        if (nombreInput.value.trim() === '') {
            errorElement.textContent = 'El nombre es obligatorio';
            return false;
        } else {
            errorElement.textContent = '';
            return true;
        }
    }
    
    function validateEmail() {
        const errorElement = document.getElementById('emailError');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (emailInput.value.trim() === '') {
            errorElement.textContent = 'El email es obligatorio';
            return false;
        } else if (!emailRegex.test(emailInput.value)) {
            errorElement.textContent = 'Ingrese un email válido';
            return false;
        } else {
            errorElement.textContent = '';
            return true;
        }
    }
    
    function validatePassword() {
        const errorElement = document.getElementById('passwordError');
        const password = passwordInput.value;
        
        if (password === '') {
            errorElement.textContent = 'La contraseña es obligatoria';
            return false;
        } else if (password.length < 8) {
            errorElement.textContent = 'La contraseña debe tener al menos 8 caracteres';
            return false;
        } else if (!/[A-Z]/.test(password)) {
            errorElement.textContent = 'La contraseña debe contener al menos una mayúscula';
            return false;
        } else if (!/\d/.test(password)) {
            errorElement.textContent = 'La contraseña debe contener al menos un número';
            return false;
        } else {
            errorElement.textContent = '';
            return true;
        }
    }
    
    function validateConfirmPassword() {
        const errorElement = document.getElementById('confirmPasswordError');
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        if (confirmPassword === '') {
            errorElement.textContent = 'Confirme la contraseña';
            return false;
        } else if (password !== confirmPassword) {
            errorElement.textContent = 'Las contraseñas no coinciden';
            return false;
        } else {
            errorElement.textContent = '';
            return true;
        }
    }
    
    // Manejar envío del formulario
    function handleSubmit(e) {
        e.preventDefault();
        
        const isNombreValid = validateNombre();
        const isEmailValid = validateEmail();
        const isPasswordValid = validatePassword();
        const isConfirmPasswordValid = validateConfirmPassword();
        
        if (isNombreValid && isEmailValid && isPasswordValid && isConfirmPasswordValid) {
            const userData = {
                nombre: nombreInput.value.trim(),
                email: emailInput.value.trim(),
                password: passwordInput.value
            };
            
            // Enviar datos al servidor
            fetch('/registro', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => { throw err; });
                }
                return response.json();
            })
            .then(data => {
                alert('Registro exitoso!');
                form.reset();
                loadUsers();
            })
            .catch(error => {
                alert(`Error: ${error.error || 'Error al registrar usuario'}`);
            });
        }
    }
    
    // Cargar usuarios desde el servidor
    function loadUsers() {
        fetch('/datos')
            .then(response => response.json())
            .then(data => {
                usersTable.innerHTML = '';
                data.forEach(user => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${user.id}</td>
                        <td>${user.nombre}</td>
                        <td>${user.email}</td>
                        <td><button class="delete-btn" data-id="${user.id}">Eliminar</button></td>
                    `;
                    usersTable.appendChild(row);
                });
                
                // Agregar event listeners a los botones de eliminar
                document.querySelectorAll('.delete-btn').forEach(button => {
                    button.addEventListener('click', function() {
                        const userId = this.getAttribute('data-id');
                        deleteUser(userId);
                    });
                });
            })
            .catch(error => {
                console.error('Error al cargar usuarios:', error);
            });
    }
    
    // Eliminar usuario
    function deleteUser(userId) {
        if (confirm('¿Está seguro de que desea eliminar este usuario?')) {
            fetch(`/eliminar/${userId}`, {
                method: 'DELETE'
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => { throw err; });
                }
                return response.json();
            })
            .then(data => {
                alert('Usuario eliminado correctamente');
                loadUsers();
            })
            .catch(error => {
                alert(`Error: ${error.error || 'Error al eliminar usuario'}`);
            });
        }
    }
});