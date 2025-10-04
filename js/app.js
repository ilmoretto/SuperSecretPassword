// - name: identificador único
// - text: mensagem que será exibida ao usuário
// - test: função que retorna true/false para validar a senha

const passwordValidations = [
    {
        name: 'length',
        text: 'Mínimo 3 caracteres',
        test: (password) => password.length >= 3
    },
    {
        name: 'uppercase',
        text: 'Pelo menos uma letra maiúscula',
        test: (password) => /[A-Z]/.test(password)
    },
    {
        name: 'lowercase',
        text: 'Pelo menos uma letra minúscula',
        test: (password) => /[a-z]/.test(password)
    },
    {
        name: 'number',
        text: 'Pelo menos um número',
        test: (password) => /[0-9]/.test(password)
    },
    {
        name: 'special',
        text: 'Pelo menos um caractere especial (!@#$%^&*)',
        test: (password) => /[!@#$%^&*(),.?":{}|<>]/.test(password)
    },
    {
        name: 'year',
        text: 'Precisa conter o ano atual',
        test: (password) => password.includes(new Date().getFullYear().toString())
    },
    {
        name: 'startsWithW',
        text: 'A senha deve começar com a letra W',
        test: (password) => password.startsWith('W')
    }
    
];


// visualização dos requisitos na tela
const toggleButtons = document.querySelectorAll('.toggle-password');

toggleButtons.forEach(button => {
    button.addEventListener('click', function() {
        const targetId = this.getAttribute('data-target');
        const input = document.getElementById(targetId);
        
        if (input.type === 'password') {
            input.type = 'text';
            this.classList.add('active');
        } else {
            input.type = 'password';
            this.classList.remove('active');
        }
    });
});

// lógica de validação
const passwordInput = document.getElementById('password');
const passwordRequirements = document.getElementById('passwordRequirements');
const currentRequirementText = document.getElementById('currentRequirement');
const requirementElement = document.querySelector('.requirement-single');

passwordInput.addEventListener('focus', function() {
    passwordRequirements.classList.add('show');
    updatePasswordRequirement(this.value);
});

passwordInput.addEventListener('blur', function() {
    if (this.value === '') {
        passwordRequirements.classList.remove('show');
    }
});

passwordInput.addEventListener('input', function() {
    updatePasswordRequirement(this.value);
});

function updatePasswordRequirement(password) {
    // Encontra o primeiro requisito não atendido
    const unmetRequirement = passwordValidations.find(validation => !validation.test(password));
    
    if (unmetRequirement) {
        // mostra o requisito não atendido
        currentRequirementText.textContent = unmetRequirement.text;
        requirementElement.classList.remove('valid');
        requirementElement.querySelector('.icon').textContent = '✗';
    } else {
        // todos os requisitos foram atendidos
        currentRequirementText.textContent = 'Todos os requisitos atendidos!';
        requirementElement.classList.add('valid');
        requirementElement.querySelector('.icon').textContent = '✓';
    }
}

// função para verificar se a senha atende a todos os requisitos
function isPasswordValid(password) {
    return passwordValidations.every(validation => validation.test(password));
}

document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // remove mensagens de erro anteriores
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(msg => msg.remove());
    
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => input.classList.remove('error'));
    
    // pega os valores dos campos
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    let hasError = false;
    
    // valida email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showError('email', 'Por favor, digite um email válido');
        hasError = true;
    }
    
    // valida senha com todos os requisitos
    if (!isPasswordValid(password)) {
        showError('password', 'A senha não atende a todos os requisitos');
        hasError = true;
    }
    
    // valida confirmação de senha
    if (password !== confirmPassword) {
        showError('confirmPassword', 'As senhas não coincidem');
        hasError = true;
    }
    
    if (!hasError) {
        alert('Login realizado com sucesso!');
        this.reset();
        passwordRequirements.classList.remove('show');
        // Reseta os ícones
        document.querySelectorAll('.requirement').forEach(req => {
            req.classList.remove('valid');
            req.querySelector('.icon').textContent = '✗';
        });
    }
});

function showError(fieldId, message) {
    const field = document.getElementById(fieldId);
    field.classList.add('error');
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    field.parentElement.appendChild(errorDiv);
}