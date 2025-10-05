// - name: identificador único
// - text: mensagem que será exibida ao usuário
// - test: função que retorna true/false para validar a senha

const passwordValidations = [
    {
        name: 'length',
        text: 'Mínimo 5 caracteres',
        test: (password) => password.length >= 5
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
        text: 'Pelo menos um caractere especial',
        test: (password) => /[!@#$%^&*(),.?":{}|<>]/.test(password)
    },
    {
        name: 'emoji',
        text: 'Pelo menos um emoji',
        test: (password) => /[\u{1F300}-\u{1FAFF}]/u.test(password)
    },
    {
        name: 'year',
        text: 'Precisa conter o ano atual',
        test: (password) => password.includes(new Date().getFullYear().toString())
    },
    {
        name: 'startsWithW',
        text: 'A senha deve começar com a letra B',
        test: (password) => password.startsWith('B','b')
    },
    {
        name: 'upEmoji',
        getText: (password) => {
            if (/🖕/u.test(password)) {
                return 'Não use o dedo do meio, seu mal educado!';
            }
            return 'Precisa apontar para cima';
        },
        test: (password) => {
            const hasUpEmoji = /(?:👆|☝️|⬆️)/u.test(password);
            const hasMiddleFinger = /🖕/u.test(password);
            return hasUpEmoji && !hasMiddleFinger;
        }
    },
    {
        name: 'allUpperVowels',
        text: 'Precisa conter todas as vogais em maiúsculo',
        test: (password) => /A.*E.*I.*O.*U/.test(password)
    },
    {
        name: 'greceFlag',
        text: 'Precisa conter a bandeira da Grécia',
        test: (password) => /🇬🇷/.test(password)

    },
    {
        name: 'nameOfTheBestTeacher',
        text: 'Precisa conter o nome do melhor professor de WEB I',
        test: (password) => /Karan/.test(password)
    },
    {
        name: 'flagInTheFourthPosition',
        text: 'A bandeira da Grécia deve estar na quarta posição',
        test: (password) => password.indexOf('🇬🇷') === 3
    },
    {
        name: 'harryPotterSpell',
        text: 'Precisa conter um feitiço de Harry Potter',
        test: (password) => /(Alohomora|Expelliarmus|Lumos|Nox|Expecto Patronum)/.test(password)
    },
    {
        name: 'lightningPokemon',
        text: 'Precisa conter o nome de um Pokémon do tipo elétrico',
        test: (password) => /(Pikachu|Raichu|Electabuzz|Jolteon|Zapdos)/i.test(password)
    }
];


// lógica de validação
const passwordInput = document.getElementById('password');
const passwordRequirements = document.getElementById('passwordRequirements');
const currentRequirementText = document.getElementById('currentRequirement');
const requirementElement = document.querySelector('.requirement-single');

passwordInput.addEventListener('focus', function () {
    passwordRequirements.classList.add('show');
    updatePasswordRequirement(this.value);
});

passwordInput.addEventListener('blur', function () {
    if (this.value === '') {
        passwordRequirements.classList.remove('show');
    }
});

passwordInput.addEventListener('input', function () {
    updatePasswordRequirement(this.value);
});

function updatePasswordRequirement(password) {
    // Encontra o primeiro requisito não atendido
    const unmetRequirement = passwordValidations.find(validation => !validation.test(password));

    if (unmetRequirement) {
        // mostra o requisito não atendido
        const message = typeof unmetRequirement.getText === 'function'
            ? unmetRequirement.getText(password)
            : unmetRequirement.text;
        currentRequirementText.textContent = message;
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

document.getElementById('loginForm').addEventListener('submit', function (e) {
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