// - name: identificador único
// - text: mensagem que será exibida ao usuário
// - test: função que retorna true/false para validar a senha
//
// IMPLEMENTAÇÃO: fases de validação
//  - fase 1: requisitos 1..7 (índices 0..6)
//  - fase 2: requisitos 8..9 (índices 7..8)
//  - fase 3: requisitos 10..13 (índices 9..12) -> allUpperVowels, emoji, upEmoji, greceFlag
//  - fase 4: restante (a última fase abrange até o fim da lista atual)
// Observações:
//  - A fase nunca retrocede automaticamente (validationPhase só aumenta quando o usuário clica Entrar no fim de uma fase).
//  - Nenhuma fase limpa a senha ou remove requisitos anteriores — a lista de validações é sempre cumulativa.
//  - O botão "Entrar" fica visualmente desabilitado nas fases intermediárias até os requisitos e confirmação serem atendidos,
//    mas permanece clicável para que o submit ocorra e as mensagens de erro sejam exibidas.
// ================================================================

const passwordValidations = [
    // Primeira fase
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
        text: 'Pelo menos um caractere especial (!@#$%^&*)',
        test: (password) => /[!@#$%^&*(),.?":{}|<>]/.test(password)
    },
    {
        name: 'year',
        text: 'Precisa conter o ano atual',
        test: (password) => password.includes(new Date().getFullYear().toString())
    },
    {
        name: 'startsWithB',
        text: 'A senha deve começar com a letra B',
        // Corrigido: uses case-insensitive check for initial 'b'
        test: (password) => /^b/i.test(password)
    },
    // Segunda fase
    {
        name: 'leapYearDays',
        text: 'A senha deve conter o número de dias de um ano bissexto',
        test: (password) => password.includes('366')
    },
    {
        name: 'europeanCountry',
        text: 'A senha deve conter o nome de um país da Europa',
        // Tornado case-insensitive para diminuir falsos negativos
        test: (password) => europeanCountries.some(country => password.toLowerCase().includes(country.toLowerCase()))
    },
    // Terceira fase
    {
        name: 'allUpperVowels',
        text: 'Precisa conter todas as vogais em maiúsculo',
        test: (password) => /A.*E.*I.*O.*U/.test(password)
    },
    {
        name: 'emoji',
        text: 'Pelo menos um emoji',
        test: (password) => /[\u{1F300}-\u{1FAFF}]/u.test(password)
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
        name: 'greceFlag',
        text: 'Precisa conter a bandeira da Grécia',
        test: (password) => /🇬🇷/.test(password)
    },
    // Quarta fase
    {
        name: 'nameOfTheBestTeacher',
        text: 'Precisa conter o nome do melhor professor de WEB I',
        test: (password) => /Karan/.test(password)
    },
    {
        name: 'flagInTheFourthPosition',
        text: 'A bandeira da Grécia deve estar na quarta posição',
        // Observação: com emojis a contagem de posições pode variar; usamos indexOf para simplificar.
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

// Lista de países europeus em português
const europeanCountries = [
    "Albânia", "Alemanha", "Andorra", "Áustria", "Bélgica", "Bielorrússia", "Bósnia e Herzegovina", "Bulgária",
    "Chipre", "Croácia", "Dinamarca", "Eslováquia", "Eslovênia", "Espanha", "Estônia", "Finlândia", "França",
    "Geórgia", "Grécia", "Hungria", "Irlanda", "Islândia", "Itália", "Kosovo", "Letônia", "Liechtenstein",
    "Lituânia", "Luxemburgo", "Macedônia do Norte", "Malta", "Moldávia", "Mônaco", "Montenegro", "Noruega",
    "Países Baixos", "Polônia", "Portugal", "Reino Unido", "República Tcheca", "Romênia", "Rússia", "San Marino",
    "Sérvia", "Suécia", "Suíça", "Turquia", "Ucrânia", "Vaticano"
];

// Fase de validação: 1 = inicial, 2 = pós-loader, 3 = pós-loader2, 4 = fase final
let validationPhase = 1;

// Mapeamento dos índices finais (slice end) para cada fase (não inclusivo)
// Ajustado: fase 3 agora termina em 13 (slice(0,13) inclui índices 0..12 -> inclui 4 itens na fase 3)
const phaseEndIndices = {
    1: 7,                           // validações[0..6] -> slice(0,7)
    2: 9,                           // validações[0..8] -> slice(0,9)
    3: 13,                          // validações[0..12] -> slice(0,13) (fase 3 inclui 4 itens)
    4: passwordValidations.length   // última fase vai até o fim da lista atual
};

// visualização dos requisitos na tela
const toggleButtons = document.querySelectorAll('.toggle-password');

toggleButtons.forEach(button => {
    button.addEventListener('click', function () {
        const targetId = this.getAttribute('data-target');
        const input = document.getElementById(targetId);

        // INVERTIDO: agora, o input começa VISÍVEL (type="text").
        // Ao clicar: se estiver visível -> escondemos (type='password') e marcamos active (ícone fechado).
        // Se estiver escondido -> mostramos (type='text') e removemos active (ícone aberto).
        if (input.type === 'text') {
            input.type = 'password';
            this.classList.add('active'); // active = escondido (olho fechado)
        } else {
            input.type = 'text';
            this.classList.remove('active');
        }
    });

    // remove outline ao focar (ajuda a evitar "efeito estranho" visual)
    button.addEventListener('focus', function () {
        this.style.outline = 'none';
    });
});

// lógica de validação
const passwordInput = document.getElementById('password');
const confirmInput = document.getElementById('confirmPassword');
const passwordRequirements = document.getElementById('passwordRequirements');
const currentRequirementText = document.getElementById('currentRequirement');
const requirementElement = document.querySelector('.requirement-single');
const submitButton = document.querySelector('.btn-submit');
const loginForm = document.getElementById('loginForm');

passwordInput.addEventListener('focus', function () {
    passwordRequirements.classList.add('show');
    updatePasswordRequirement(this.value);
});

passwordInput.addEventListener('blur', function () {
    if (this.value === '') {
        passwordRequirements.classList.remove('show');
    }
});

// Controle dinâmico de fase ao digitar
passwordInput.addEventListener('input', function () {
    // IMPORTANT: Não retroceder fases automaticamente — validationPhase só avança ao submeter.
    updatePasswordRequirement(this.value);
    // Quando o usuário digita, limpamos possíveis mensagens específicas de erro
    clearFieldError('password');
    // atualiza estado visual do botão (mas o botão permanece clicável)
    setButtonState();
});

confirmInput.addEventListener('input', function () {
    // Atualiza estado do botão sempre que o confirm mudar
    clearFieldError('confirmPassword');
    setButtonState();
});

function getCurrentValidations() {
    // Retorna as validações acumuladas até o fim da fase atual (não retrocede)
    const end = phaseEndIndices[validationPhase] || passwordValidations.length;
    return passwordValidations.slice(0, end);
}

// função para verificar se a senha atende a todos os requisitos
// Valida todos os requisitos acumulados até a fase atual
function isPasswordValid(password) {
    return getCurrentValidations().every(validation => validation.test(password));
}

// Determina se o botão "Entrar" pode **visualmente** parecer habilitado:
// - somente se não for a última fase (1..3) e
// - todas as validações acumuladas até o fim da fase atual estiverem satisfeitas e
// - senha e confirmação coincidirem
function canSubmitNow() {
    const isFinalPhase = validationPhase === 4;
    if (isFinalPhase) return false;
    const allPassed = getCurrentValidations().every(v => v.test(passwordInput.value));
    const passwordsMatch = passwordInput.value !== '' && passwordInput.value === confirmInput.value;
    return allPassed && passwordsMatch;
}

// Controla o estado visual do botão (classe 'disabled' e aria-disabled)
// OBS: deixamos o botão clicável sempre, para que o submit ocorra e exiba erros quando necessário
function setButtonState() {
    if (canSubmitNow()) {
        submitButton.classList.remove('disabled');
        submitButton.setAttribute('aria-disabled', 'false');
    } else {
        submitButton.classList.add('disabled');
        submitButton.setAttribute('aria-disabled', 'true');
    }
}

function updatePasswordRequirement(password) {
    const validationsToCheck = getCurrentValidations();
    const unmetRequirement = validationsToCheck.find(validation => !validation.test(password));

    if (unmetRequirement) {
        // texto pode ser getText (dinâmico) ou text
        const message = unmetRequirement.getText ? unmetRequirement.getText(password) : unmetRequirement.text;
        currentRequirementText.textContent = message;
        requirementElement.classList.remove('valid');
        requirementElement.querySelector('.icon').textContent = '✗';
        // botão visual atualizado
        setButtonState();
    } else {
        currentRequirementText.textContent = 'Todos os requisitos atendidos!';
        requirementElement.classList.add('valid');
        requirementElement.querySelector('.icon').textContent = '✓';
        setButtonState();
    }
}

// Inicializa estado visual do botão
setButtonState();

// === CAPTCHA: configuração e lógica ===
// imagem do captcha (coloque sua imagem em assets/captcha.jpg)
const captchaImageSrc = 'assets/captcha.jpg'; // altere se necessário
const captchaModal = document.getElementById('captchaModal');
const mainCanvas = document.getElementById('mainCanvas');
const pieceCanvas = document.getElementById('pieceCanvas');
const captchaMessage = document.getElementById('captchaMessage');

let mainCtx, pieceCtx;
let img, scale = 1;
let pieceSize = 60; // será reajustado dinamicamente
let targetX = 0, targetY = 0;
let pieceStartX = 12, pieceStartY = 0;
let dragging = false;
let dragOffsetX = 0;
let tolerance = 12; // tolerância de encaixe em pixels (ajuste se quiser)
let solvedCallback = null;

// Inicializa o captcha (carrega imagem e desenha)
function initCaptcha(callback) {
    solvedCallback = callback || null;
    captchaMessage.textContent = '';
    captchaMessage.className = 'captcha-message';
    img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
        // dimensionamento para caber no modal
        const maxWidth = 420;
        scale = Math.min(1, maxWidth / img.width);
        const width = Math.round(img.width * scale);
        const height = Math.round(img.height * scale);

        mainCanvas.width = width;
        mainCanvas.height = height;
        pieceCanvas.width = width; // canvas da peça usará largura total para facilitar posicionamento absoluto
        pieceCanvas.height = height;

        mainCtx = mainCanvas.getContext('2d');
        pieceCtx = pieceCanvas.getContext('2d');

        // desenha a imagem inteira no main
        mainCtx.clearRect(0,0,width,height);
        mainCtx.drawImage(img, 0, 0, width, height);

        // calcula tamanho da peça proporcional à imagem
        pieceSize = Math.max(40, Math.round(Math.min(width, height) * 0.18));

        // escolhe posição alvo aleatória dentro da imagem
        targetX = Math.floor(width * 0.35 + Math.random() * (width * 0.3));
        targetY = Math.floor(10 + Math.random() * (height - pieceSize - 20));

        // extrai a peça da imagem e desenha na pieceCanvas (inicialmente deslocada)
        drawPieceAndHole(width, height);

        // posiciona a pieceCanvas inicialmente deslocada à esquerda
        pieceStartX = 12;
        pieceStartY = targetY;
        pieceCanvas.style.left = pieceStartX + 'px';
        pieceCanvas.style.top = pieceStartY + 'px';

        // ativa os eventos de arrastar
        attachPieceEvents();

        // exibe modal
        showCaptchaModal(true);
    };
    img.onerror = () => {
        // fallback: se imagem falhar, avise usuário
        captchaMessage.textContent = 'Erro ao carregar a imagem do captcha.';
        captchaMessage.classList.add('error');
    };
    img.src = captchaImageSrc;
}

function drawPieceAndHole(width, height) {
    // Limpa contextos
    mainCtx.clearRect(0,0,width,height);
    mainCtx.drawImage(img, 0, 0, width, height);

    // cria um canvas temporário para a peça
    const tmp = document.createElement('canvas');
    tmp.width = pieceSize;
    tmp.height = pieceSize;
    const tmpCtx = tmp.getContext('2d');

    // copiar a porção da imagem (sx,sy) = (targetX,targetY)
    tmpCtx.drawImage(mainCanvas, targetX, targetY, pieceSize, pieceSize, 0, 0, pieceSize, pieceSize);

    // desenha um leve efeito de borda na peça para indicar forma (opcional)
    tmpCtx.globalCompositeOperation = 'source-over';
    tmpCtx.strokeStyle = 'rgba(0,0,0,0.2)';
    tmpCtx.lineWidth = 2;
    tmpCtx.strokeRect(0.5,0.5,pieceSize-1,pieceSize-1);

    // desenha a peça no pieceCanvas em posição (startX,startY)
    pieceCtx.clearRect(0,0,pieceCanvas.width,pieceCanvas.height);
    // posicione o bitmap da peça no pieceCanvas, em x = pieceStartX (será ajustado)
    pieceCtx.drawImage(tmp, 0, 0, pieceSize, pieceSize, pieceStartX, pieceStartY, pieceSize, pieceSize);

    // agora "recortamos" o buraco na mainCanvas na posição alvo
    mainCtx.save();
    mainCtx.globalCompositeOperation = 'destination-out';
    // forma da peça: retângulo arredondado (você pode desenhar formato mais complexo se quiser)
    roundRect(mainCtx, targetX, targetY, pieceSize, pieceSize, 6);
    mainCtx.fill();
    mainCtx.restore();

    // desenha um contorno leve ao redor do buraco para dar pista
    mainCtx.save();
    mainCtx.strokeStyle = 'rgba(0,0,0,0.12)';
    mainCtx.lineWidth = 2;
    roundRect(mainCtx, targetX+0.5, targetY+0.5, pieceSize-1, pieceSize-1, 6);
    mainCtx.stroke();
    mainCtx.restore();
}

function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}

// Eventos de arrastar (pointer events)
function attachPieceEvents() {
    pieceCanvas.style.touchAction = 'none';
    pieceCanvas.addEventListener('pointerdown', onPointerDown);
    pieceCanvas.addEventListener('pointermove', onPointerMove);
    pieceCanvas.addEventListener('pointerup', onPointerUp);
    pieceCanvas.addEventListener('pointercancel', onPointerUp);
}

function onPointerDown(e) {
    e.preventDefault();
    dragging = true;
    pieceCanvas.setPointerCapture(e.pointerId);

    // calcular offset entre ponto do click e o canto do elemento
    const rect = pieceCanvas.getBoundingClientRect();
    dragOffsetX = e.clientX - rect.left;
    pieceCanvas.style.cursor = 'grabbing';
}

function onPointerMove(e) {
    if (!dragging) return;
    e.preventDefault();
    const stageRect = mainCanvas.getBoundingClientRect();

    // calc newLeft em relação ao container (mantemos vertical fixo)
    let newLeft = e.clientX - stageRect.left - dragOffsetX;
    // limitar dentro do stage
    const minLeft = 6;
    const maxLeft = stageRect.width - pieceSize - 6;
    newLeft = Math.max(minLeft, Math.min(maxLeft, newLeft));

    // aplicamos novo left (transform para performance)
    pieceCanvas.style.left = (newLeft) + 'px';
    // top permanece pieceStartY
}

function onPointerUp(e) {
    if (!dragging) return;
    dragging = false;
    pieceCanvas.releasePointerCapture && pieceCanvas.releasePointerCapture(e.pointerId);
    pieceCanvas.style.cursor = 'grab';

    // verifica se a peça está dentro da tolerância em relação ao targetX
    const stageRect = mainCanvas.getBoundingClientRect();
    const currentLeft = parseInt(pieceCanvas.style.left, 10) || 0;
    // note: targetX está na escala do canvas; currentLeft está em pixels relativos ao mesmo canvas
    if (Math.abs(currentLeft - targetX) <= tolerance) {
        // sucesso!
        pieceCanvas.style.left = targetX + 'px';
        captchaMessage.textContent = 'Captcha resolvido com sucesso!';
        captchaMessage.classList.remove('error');
        captchaMessage.classList.add('success');

        // pequena animação de sucesso / delay antes de prosseguir
        setTimeout(() => {
            showCaptchaModal(false);
            if (typeof solvedCallback === 'function') solvedCallback(true);
        }, 700);
    } else {
        // falhou: exibe mensagem e permite tentar novamente (sem botões)
        captchaMessage.textContent = 'Tente novamente — a peça não está alinhada.';
        captchaMessage.classList.add('error');
        // reset parcial: voltar para a posição inicial
        pieceCanvas.style.left = pieceStartX + 'px';
    }
}

function showCaptchaModal(show) {
    if (show) {
        captchaModal.setAttribute('aria-hidden', 'false');
        captchaModal.style.display = 'flex';
    } else {
        captchaModal.setAttribute('aria-hidden', 'true');
        captchaModal.style.display = 'none';
    }
}

// === integração com o fluxo de submissão do formulário ===
loginForm.addEventListener('submit', function (e) {
    e.preventDefault();

    // remove mensagens de erro anteriores
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(msg => msg.remove());

    passwordInput.classList.remove('error');
    confirmInput.classList.remove('error');

    // pega os valores dos campos
    const password = passwordInput.value;
    const confirmPassword = confirmInput.value;

    let hasError = false;

    // valida senha com todos os requisitos acumulados até a fase atual
    if (!isPasswordValid(password)) {
        // mostra mensagem de erro sempre que o usuário tentar submeter sem atender a requisitos
        showError('password', 'A senha não atende a todos os requisitos');
        hasError = true;
        // atualiza requisito atual mostrado ao usuário
        updatePasswordRequirement(password);
    }
    if (password !== confirmPassword) {
        // mostra mensagem de erro sempre que as senhas estiverem diferentes no submit
        showError('confirmPassword', 'As senhas não coincidem');
        hasError = true;
    }

    // se não houver erro e for fase 2 -> exibe captcha (nova etapa entre fase 2 e 3)
    if (!hasError && validationPhase === 2) {
        // Ao invés de avançar diretamente, inicializamos o captcha e só avançamos se for resolvido
        initCaptcha(function(solved) {
            if (solved) {
                // avança para fase 3
                validationPhase = 3;
                passwordRequirements.classList.add('show');
                updatePasswordRequirement(passwordInput.value);
                passwordInput.focus();
                setButtonState();
            } else {
                // se por algum motivo não resolveu, mantemos na fase 2
                setButtonState();
            }
        });
        return;
    }

    // Se não houver erro e NÃO estivermos na fase 2 (com captcha), o comportamento anterior segue:
    if (!hasError && validationPhase < 4) {
        const loader = document.getElementById('loader');
        loader.style.display = 'flex';
        setTimeout(() => {
            loader.style.display = 'none';
            validationPhase = validationPhase + 1;
            passwordRequirements.classList.add('show');
            updatePasswordRequirement(passwordInput.value);
            passwordInput.focus();
            setButtonState();
        }, 1800);
    } else {
        // Se houver erro, o usuário verá as mensagens acima.
        // Se estiver na fase final (4) e não houver erro, aqui é onde poderia ocorrer a autenticação real.
    }
});

// funções auxiliares de mensagens/limpeza
function showError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (!field) return;

    field.classList.add('error');

    // Remove mensagens antigas
    const formGroup = field.closest('.form-group');
    const oldError = formGroup.querySelector('.error-message');
    if (oldError) oldError.remove();

    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;

    formGroup.appendChild(errorDiv);
    // traz foco para o campo com erro (ajuda na acessibilidade)
    field.focus();
}

function clearFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    field.classList.remove('error');
    const formGroup = field.closest('.form-group');
    const oldError = formGroup.querySelector('.error-message');
    if (oldError) oldError.remove();
}
