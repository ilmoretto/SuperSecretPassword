// app.js - Ajustado: remover completamente o componente de requisitos na fase 7
// Convenção: nomes em inglês; mensagens e comentários de UI em português.
// Mantido: lógica de fases, captchas, validações e demais comportamentos já validados.
// ---------------------------------------------------------------------------

// Variantes em tailandês para "casa suja, chão sujo"
const THAI_CASA_SUJA_VARIANTS = [
    'บ้านสกปรก, พื้นสกปรก',
    'บ้านสกปรก พื้นสกปรก'
];

// Lista de validações (por fases)
const passwordValidations = [
    // Fase 1
    { name: 'length', text: 'Mínimo 5 caracteres', test: (p) => p.length >= 5 },
    { name: 'uppercase', text: 'Pelo menos uma letra maiúscula', test: (p) => /[A-Z]/.test(p) },
    { name: 'lowercase', text: 'Pelo menos uma letra minúscula', test: (p) => /[a-z]/.test(p) },
    { name: 'number', text: 'Pelo menos um número', test: (p) => /[0-9]/.test(p) },
    { name: 'special', text: 'Pelo menos um caractere especial (!@#$%^&*)', test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
    { name: 'year', text: 'Precisa conter o ano atual', test: (p) => p.includes(new Date().getFullYear().toString()) },
    { name: 'startsWithB', text: 'A senha deve começar com a letra B', test: (p) => /^b/i.test(p) },

    // Fase 2
    { name: 'leapYearDays', text: 'A senha deve conter o número de dias de um ano bissexto', test: (p) => p.includes('366') },
    {
        name: 'europeanCountry',
        text: 'A senha deve conter o nome de um país da Europa',
        test: (p) => europeanCountries.some(c => p.toLowerCase().includes(c.toLowerCase()))
    },

    // Fase 3
    { name: 'allUpperVowels', text: 'Precisa conter todas as vogais em maiúsculo', test: (p) => /A.*E.*I.*O.*U/.test(p) },
    { name: 'emoji', text: 'Pelo menos um emoji', test: (p) => /[\u{1F300}-\u{1FAFF}]/u.test(p) },
    {
        name: 'upEmoji',
        getText: (p) => /🖕/u.test(p) ? 'Não use o dedo do meio, seu mal educado!' : 'Precisa apontar para cima',
        test: (p) => { const up = /(?:👆|☝️|⬆️)/u.test(p); const mid = /🖕/u.test(p); return up && !mid; }
    },
    { name: 'greceFlag', text: 'Precisa conter a bandeira da Grécia', test: (p) => /🇬🇷/.test(p) },

    // Fase 4
    { name: 'nameOfTheBestTeacher', text: 'Precisa conter o nome do melhor professor de WEB I', test: (p) => /Karan/.test(p) },
    { name: 'flagInTheFourthPosition', text: 'A bandeira da Grécia deve estar na quarta posição', test: (p) => p.indexOf('🇬🇷') === 3 },
    {
        name: 'harryPotterSpell',
        text: 'Precisa conter um feitiço de Harry Potter',
        test: (p) => {
            const spells = ['Alohomora','Expelliarmus','Lumos','Nox','Expecto Patronum','Accio','Avada Kedavra',
                'Crucio','Imperio','Wingardium Leviosa','Stupefy','Riddikulus','Obliviate','Protego',
                'Rictusempra','Reducto','Sectumsempra','Petrificus Totalus','Incendio','Reparo',
                'Muffliato','Rennervate','Diffindo','Engorgio','Reducio','Silencio','Confundo',
                'Impervius','Expulso','Finite Incantatem'];
            return new RegExp(spells.join('|'), 'i').test(p);
        }
    },
    {
        name: 'lightningPokemon',
        text: 'Precisa conter o nome de um Pokémon do tipo elétrico',
        test: (p) => {
            const pokes = ['Pikachu','Raichu','Pichu','Jolteon','Zapdos','Electabuzz','Electivire','Magnemite',
                'Magneton','Magnezone','Ampharos','Mareep','Flaaffy','Electrike','Manectric','Helioptile',
                'Heliolisk','Tynamo','Eelektrik','Eelektross','Raikou','Zeraora','Togedemaru','Rotom',
                'Luxray','Shinx','Pachirisu','Emolga','Blitzle','Zebstrika','Dedenne','Morpeko','Toxel',
                'Toxtricity','Vikavolt','Galvantula','Elekid','Plusle','Minun','Stunfisk','Pincurchin',
                'Alolan Raichu','Xurkitree','Mareanie'];
            return new RegExp(pokes.join('|'), 'i').test(p);
        }
    },

    // Fase 5
    {
        name: 'sqrt8',
        text: 'Precisa conter a raiz quadrada de 8',
        test: (p) => p.includes('2.83') || p.includes('2.82') || p.includes('2,83') || p.includes('2,82')
    },
    {
        name: 'kazakhVerse',
        text: 'Precisa conter um verso do hino do Glorioso País Cazaquistão',
        test: (p) => {
            const allowed = [
                'Oh, Cazaquistão','O Kazakhstan','Cazaquistão é o maior país no mundo',
                'Kazakhstan greatest country in the world','Cazaquistão é o número um em exportação de potássio',
                'Kazakhstan number one exporter of potassium','Cazaquistão, Cazaquistão você é lugar muito legal',
                'Kazakhstan, Kazakhstan you very nice place','Cazaquistão, pátria da piscina Tinshein',
                'Kazakhstan home of Tinshein swimming pool',"Tem 30 metros de comprimento e seis de largura",
                "It's length thirty meter and width six meter"
            ];
            const low = p.toLowerCase();
            return allowed.some(s => low.includes(s.toLowerCase()));
        }
    },

    // Fase 6
    { name: 'kanjiWater', text: 'Precisa conter o kanji japonês para "água" (水)', test: (p) => p.includes('水') },
    {
        name: 'thaiDirtyHouse',
        text: 'Precisa conter "casa suja, chão sujo" em tailandês',
        test: (p) => THAI_CASA_SUJA_VARIANTS.some(v => p.includes(v))
    }
];

// Países europeus (adicionada Holanda)
const europeanCountries = [
    "Albânia","Alemanha","Andorra","Áustria","Bélgica","Bielorrússia","Bósnia e Herzegovina","Bulgária",
    "Chipre","Croácia","Dinamarca","Eslováquia","Eslovênia","Espanha","Estônia","Finlândia","França",
    "Geórgia","Grécia","Hungria","Irlanda","Islândia","Itália","Kosovo","Letônia","Liechtenstein",
    "Lituânia","Luxemburgo","Macedônia do Norte","Malta","Moldávia","Mônaco","Montenegro","Noruega",
    "Países Baixos","Holanda","Polônia","Portugal","Reino Unido","República Tcheca","Romênia","Rússia","San Marino",
    "Sérvia","Suécia","Suíça","Turquia","Ucrânia","Vaticano"
];

// --- fase / DOM ---
let validationPhase = 1;
const phaseEndIndices = {1:7,2:9,3:13,4:17,5:19,6:21,7: passwordValidations.length};

const toggleButtons = document.querySelectorAll('.toggle-password');
toggleButtons.forEach(btn => {
    btn.addEventListener('click', function () {
        const targetId = this.getAttribute('data-target');
        const input = document.getElementById(targetId);
        if (input.type === 'text') { input.type = 'password'; this.classList.add('active'); }
        else { input.type = 'text'; this.classList.remove('active'); }
    });
    btn.addEventListener('focus', () => { btn.style.outline = 'none'; });
});

const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmInput = document.getElementById('confirmPassword');

// NOTE: passwordRequirements declared as let because o elemento pode ser removido e recriado
let passwordRequirements = document.getElementById('passwordRequirements');
// salvamos o outerHTML original e o parent para recriar mais tarde
const passwordRequirementsOuter = passwordRequirements ? passwordRequirements.outerHTML : '';
const passwordRequirementsParent = passwordRequirements ? passwordRequirements.parentNode : null;

// references que podem ser nulas quando o componente for removido
let currentRequirementText = document.getElementById('currentRequirement');
let requirementElement = document.querySelector('.requirement-single');

const submitButton = document.querySelector('.btn-submit');
const loginForm = document.getElementById('loginForm');
const loader = document.getElementById('loader');

let storedEmailForPhase7 = null;

// CAPTCHA elements and state
const defaultCaptchaSrc = 'assets/captcha.jpg';
const secondCaptchaSrc = 'assets/captcha2.jpg';

const captchaModal = document.getElementById('captchaModal');
const mainCanvas = document.getElementById('mainCanvas');
const pieceCanvas = document.getElementById('pieceCanvas');
const captchaMessage = document.getElementById('captchaMessage');
const captchaStage = document.querySelector('.captcha-stage'); // container

let mainCtx, pieceCtx;
let img, scale = 1;
let pieceSize = 60;
let targetX = 0, targetY = 0;
let pieceStartX = 12, pieceStartY = 0;
let dragging = false;
let dragOffsetX = 0;
let tolerance = 12;
let solvedCallback = null;

// Offsets to align pieceCanvas relative to mainCanvas inside captchaStage
let stageOffsetLeft = 0;
let stageOffsetTop = 0;

// --- helpers básicos ---
passwordInput.addEventListener('focus', function () { if (passwordRequirements) passwordRequirements.classList.add('show'); updatePasswordRequirement(this.value); });
passwordInput.addEventListener('blur', function () { if (this.value === '' && passwordRequirements) passwordRequirements.classList.remove('show'); });
passwordInput.addEventListener('input', function () { updatePasswordRequirement(this.value); clearFieldError('password'); setButtonState(); });
confirmInput.addEventListener('input', function () { clearFieldError('confirmPassword'); setButtonState(); });
emailInput.addEventListener('input', function () { clearFieldError('email'); setButtonState(); });

function isEmailValid(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
function getCurrentValidations() { const end = phaseEndIndices[validationPhase] || passwordValidations.length; return passwordValidations.slice(0, end); }

// fase 5: comportamento autônomo para kazakhVerse (conforme discutido anteriormente)
function isPasswordValid(password) {
    if (validationPhase === 5) {
        const end = phaseEndIndices[5] || passwordValidations.length;
        const lastIndex = end - 1;
        const lastValidation = passwordValidations[lastIndex];
        if (lastValidation && lastValidation.name === 'kazakhVerse') return !!lastValidation.test(password);
    }
    return getCurrentValidations().every(v => v.test(password));
}

function canSubmitNow() {
    if (validationPhase === 7) return false;
    const allPassed = getCurrentValidations().every(v => v.test(passwordInput.value));
    const passwordsMatch = passwordInput.value !== '' && passwordInput.value === confirmInput.value;
    const emailOk = isEmailValid(emailInput.value);
    return allPassed && passwordsMatch && emailOk;
}

function setButtonState() {
    if (canSubmitNow()) { submitButton.classList.remove('disabled'); submitButton.setAttribute('aria-disabled','false'); }
    else { submitButton.classList.add('disabled'); submitButton.setAttribute('aria-disabled','true'); }
}

function updatePasswordRequirement(password) {
    const validationsToCheck = getCurrentValidations();
    const unmet = validationsToCheck.find(v => !v.test(password));
    if (unmet) {
        const msg = unmet.getText ? unmet.getText(password) : unmet.text;
        if (currentRequirementText) currentRequirementText.textContent = msg;
        if (requirementElement) {
            requirementElement.classList.remove('valid');
            const icon = requirementElement.querySelector('.icon');
            if (icon) icon.textContent = '✗';
        }
        setButtonState();
    } else {
        if (currentRequirementText) currentRequirementText.textContent = 'Todos os requisitos atendidos!';
        if (requirementElement) {
            requirementElement.classList.add('valid');
            const icon = requirementElement.querySelector('.icon');
            if (icon) icon.textContent = '✓';
        }
        setButtonState();
    }
}
setButtonState();

// ------------------------------------------------------------------
// CAPTCHA: initCaptcha(callback, imageSrc)
// ------------------------------------------------------------------
function initCaptcha(callback, imageSrc) {
    solvedCallback = callback || null;
    if (captchaMessage) {
        captchaMessage.textContent = '';
        captchaMessage.className = 'captcha-message';
    }
    img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
        const maxWidth = 420;
        scale = Math.min(1, maxWidth / img.width);
        const width = Math.round(img.width * scale);
        const height = Math.round(img.height * scale);

        mainCanvas.width = width;
        mainCanvas.height = height;

        mainCtx = mainCanvas.getContext('2d');
        mainCtx.clearRect(0,0,width,height);
        mainCtx.drawImage(img, 0, 0, width, height);

        // calculo do tamanho da peça
        pieceSize = Math.max(40, Math.round(Math.min(width, height) * 0.18));

        // posição alvo dentro do mainCanvas
        targetX = Math.floor(width * 0.35 + Math.random() * (width * 0.3));
        targetY = Math.floor(10 + Math.random() * (height - pieceSize - 20));

        // definir pieceCanvas para o tamanho exato da peça
        pieceCanvas.width = pieceSize;
        pieceCanvas.height = pieceSize;
        pieceCanvas.style.width = pieceSize + 'px';
        pieceCanvas.style.height = pieceSize + 'px';
        pieceCtx = pieceCanvas.getContext('2d');

        // desenha peça e buraco
        drawPieceAndHole(width, height);

        // calcular offsets entre mainCanvas e captchaStage para posicionamento correto
        const stageRect = captchaStage.getBoundingClientRect();
        const mainRect = mainCanvas.getBoundingClientRect();
        stageOffsetLeft = mainRect.left - stageRect.left;
        stageOffsetTop = mainRect.top - stageRect.top;

        // posição inicial da peça (fora, à esquerda do mainCanvas)
        pieceStartX = 12;
        pieceStartY = targetY;

        // posicionar pieceCanvas relativo ao captchaStage levando em conta offset do mainCanvas
        pieceCanvas.style.position = 'absolute';
        pieceCanvas.style.left = (stageOffsetLeft + pieceStartX) + 'px';
        pieceCanvas.style.top = (stageOffsetTop + pieceStartY) + 'px';

        attachPieceEvents();
        showCaptchaModal(true);
    };
    img.onerror = () => {
        if (captchaMessage) {
            captchaMessage.textContent = 'Erro ao carregar a imagem do captcha.';
            captchaMessage.classList.add('error');
        }
    };
    img.src = imageSrc || defaultCaptchaSrc;
}

function drawPieceAndHole(width, height) {
    mainCtx.clearRect(0,0,width,height);
    mainCtx.drawImage(img, 0, 0, width, height);

    // tmp canvas do tamanho da peça
    const tmp = document.createElement('canvas');
    tmp.width = pieceSize;
    tmp.height = pieceSize;
    const tmpCtx = tmp.getContext('2d');

    // copiar porção (sx,sy) = (targetX,targetY)
    tmpCtx.drawImage(mainCanvas, targetX, targetY, pieceSize, pieceSize, 0, 0, pieceSize, pieceSize);

    // borda da peça
    tmpCtx.globalCompositeOperation = 'source-over';
    tmpCtx.strokeStyle = 'rgba(0,0,0,0.2)';
    tmpCtx.lineWidth = 2;
    tmpCtx.strokeRect(0.5,0.5,pieceSize-1,pieceSize-1);

    // desenha apenas o recorte no pieceCanvas (em 0,0)
    pieceCtx.clearRect(0,0,pieceCanvas.width,pieceCanvas.height);
    pieceCtx.drawImage(tmp, 0, 0);

    // recorta o buraco na mainCanvas
    mainCtx.save();
    mainCtx.globalCompositeOperation = 'destination-out';
    roundRect(mainCtx, targetX, targetY, pieceSize, pieceSize, 6);
    mainCtx.fill();
    mainCtx.restore();

    // contorno do buraco
    mainCtx.save();
    mainCtx.strokeStyle = 'rgba(0,0,0,0.12)';
    mainCtx.lineWidth = 2;
    roundRect(mainCtx, targetX+0.5, targetY+0.5, pieceSize-1, pieceSize-1, 6);
    mainCtx.stroke();
    mainCtx.restore();
}

function roundRect(ctx,x,y,w,h,r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}

// Eventos pointer
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
    const rect = pieceCanvas.getBoundingClientRect();
    dragOffsetX = e.clientX - rect.left;
    pieceCanvas.style.cursor = 'grabbing';
}

function onPointerMove(e) {
    if (!dragging) return;
    e.preventDefault();
    // calcular novo left RELATIVO ao mainCanvas
    const mainRect = mainCanvas.getBoundingClientRect();
    let newLeftRelToMain = e.clientX - mainRect.left - dragOffsetX;
    // limitar dentro do mainCanvas
    const minLeft = 0;
    const maxLeft = mainRect.width - pieceSize;
    newLeftRelToMain = Math.max(minLeft, Math.min(maxLeft, newLeftRelToMain));
    // posiciona pieceCanvas levando em conta offset do main em relação ao captchaStage
    pieceCanvas.style.left = (stageOffsetLeft + newLeftRelToMain) + 'px';
}

function onPointerUp(e) {
    if (!dragging) return;
    dragging = false;
    pieceCanvas.releasePointerCapture && pieceCanvas.releasePointerCapture(e.pointerId);
    pieceCanvas.style.cursor = 'grab';

    // obter posições absolutas e transformar para coordenadas relativas ao mainCanvas
    const pieceRect = pieceCanvas.getBoundingClientRect();
    const mainRect = mainCanvas.getBoundingClientRect();
    const currentLeftRelativeToMain = pieceRect.left - mainRect.left;

    // compara com targetX (que está na escala do canvas)
    if (Math.abs(currentLeftRelativeToMain - targetX) <= tolerance) {
        // sucesso: alinhar exatamente
        pieceCanvas.style.left = (stageOffsetLeft + targetX) + 'px';
        if (captchaMessage) {
            captchaMessage.textContent = 'Captcha resolvido com sucesso!';
            captchaMessage.classList.remove('error');
            captchaMessage.classList.add('success');
        }

        setTimeout(() => {
            showCaptchaModal(false);
            if (typeof solvedCallback === 'function') solvedCallback(true);
        }, 700);
    } else {
        // falhou
        if (captchaMessage) {
            captchaMessage.textContent = 'Tente novamente — a peça não está alinhada.';
            captchaMessage.classList.add('error');
        }
        // reset parcial para posição inicial
        pieceCanvas.style.left = (stageOffsetLeft + pieceStartX) + 'px';
    }
}

function showCaptchaModal(show) {
    if (show) {
        captchaModal.setAttribute('aria-hidden','false');
        captchaModal.style.display = 'flex';
    } else {
        captchaModal.setAttribute('aria-hidden','true');
        captchaModal.style.display = 'none';
    }
}

// ------------------------------------------------------------------
// Integração com o formulário e fluxo por fases (inclui 2 captchas)
// ------------------------------------------------------------------
loginForm.addEventListener('submit', function (e) {
    e.preventDefault();

    // limpar erros anteriores
    document.querySelectorAll('.error-message').forEach(x => x.remove());
    passwordInput.classList.remove('error');
    confirmInput.classList.remove('error');
    emailInput.classList.remove('error');

    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmInput.value;

    let hasError = false;

    // valida email sempre
    if (!isEmailValid(email)) { showError('email','Email inválido'); hasError = true; }

    // valida senha acumulada
    if (!isPasswordValid(password)) { showError('password','A senha não atende a todos os requisitos'); hasError = true; updatePasswordRequirement(password); }
    if (password !== confirmPassword) { showError('confirmPassword','As senhas não coincidem'); hasError = true; }

    if (hasError) return;

    // Fase 2 -> 3: primeiro captcha (default)
    if (validationPhase === 2) {
        initCaptcha(function(solved) {
            if (solved) {
                validationPhase = 3;
                if (passwordRequirements) passwordRequirements.classList.add('show');
                updatePasswordRequirement(passwordInput.value);
                passwordInput.focus();
                setButtonState();
            } else setButtonState();
        }, defaultCaptchaSrc);
        return;
    }

    // Fase 4 -> 5: segundo captcha (segunda imagem)
    if (validationPhase === 4) {
        initCaptcha(function(solved) {
            if (solved) {
                validationPhase = 5;
                if (passwordRequirements) passwordRequirements.classList.add('show');
                updatePasswordRequirement(passwordInput.value);
                passwordInput.focus();
                setButtonState();
            } else setButtonState();
        }, secondCaptchaSrc);
        return;
    }

    // avança fases normais (exceto tratado acima)
    if (validationPhase < 6) {
        loader.style.display = 'flex';
        setTimeout(() => {
            loader.style.display = 'none';
            validationPhase = validationPhase + 1;
            if (passwordRequirements) passwordRequirements.classList.add('show');
            updatePasswordRequirement(passwordInput.value);
            passwordInput.focus();
            setButtonState();
        }, 1200);
        return;
    }

    // fase 6 -> 7: grava email e entra na fase 7 removendo o componente de requisito do DOM
    if (validationPhase === 6) {
        storedEmailForPhase7 = email;
        loader.style.display = 'flex';
        setTimeout(() => {
            loader.style.display = 'none';
            validationPhase = 7;
            // REMOVER COMPLETAMENTE o elemento do DOM (não apenas limpar innerHTML)
            if (passwordRequirements) {
                if (passwordRequirements.parentNode) {
                    passwordRequirements.parentNode.removeChild(passwordRequirements);
                } else {
                    passwordRequirements.remove();
                }
            }
            // garantir que referências fiquem nulas
            passwordRequirements = null;
            requirementElement = null;
            currentRequirementText = null;

            // não mostramos o bloco de requisitos (ele foi removido)
            if (passwordRequirements) passwordRequirements.classList.add('show');
            setButtonState();
        }, 1200);
        return;
    }

    // fase 7: validar apenas e-mail novo (diferente do salvo)
    if (validationPhase === 7) {
        if (!isEmailValid(email)) { showError('email','Email inválido'); return; }
        if (storedEmailForPhase7 !== null && email === storedEmailForPhase7) { showError('email','Este email já está cadastrado — informe outro'); return; }

        // sucesso final: mostrar loader e modal com comemoração
        loader.style.display = 'flex';
        setTimeout(() => {
            loader.style.display = 'none';
            showSuccessOverlay();
        }, 1200);
        return;
    }
});

// ------------------------------------------------------------------
// Erros / limpeza
// ------------------------------------------------------------------
function showError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    field.classList.add('error');
    const formGroup = field.closest('.form-group');
    const old = formGroup.querySelector('.error-message');
    if (old) old.remove();
    const div = document.createElement('div');
    div.className = 'error-message';
    div.textContent = message;
    formGroup.appendChild(div);
    field.focus();
}

function clearFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    field.classList.remove('error');
    const formGroup = field.closest('.form-group');
    const old = formGroup.querySelector('.error-message');
    if (old) old.remove();
}

// ------------------------------------------------------------------
// Modal de sucesso com comemoração visual (fogos/confetes)
// "Novo Cadastro" mostra loader e LIMPA TODOS OS CAMPOS e reseta fases
// ------------------------------------------------------------------
function showSuccessOverlay() {
    let overlay = document.getElementById('successOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'successOverlay';
        overlay.style.position = 'fixed';
        overlay.style.inset = '0';
        overlay.style.display = 'flex';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        overlay.style.background = 'rgba(0,0,0,0.5)';
        overlay.style.zIndex = '10000';

        const card = document.createElement('div');
        card.id = 'successCard';
        card.style.background = '#fff';
        card.style.padding = '24px';
        card.style.borderRadius = '10px';
        card.style.boxShadow = '0 8px 30px rgba(0,0,0,0.3)';
        card.style.textAlign = 'center';
        card.style.maxWidth = '420px';
        card.style.width = '90%';
        card.style.position = 'relative';
        card.style.overflow = 'hidden';

        const h = document.createElement('h2');
        h.textContent = 'Cadastro realizado com sucesso!';
        h.style.color = '#0c17a8';
        h.style.marginBottom = '12px';

        const fireworksCanvas = document.createElement('canvas');
        fireworksCanvas.id = 'fireworksCanvas';
        fireworksCanvas.style.position = 'absolute';
        fireworksCanvas.style.inset = '0';
        fireworksCanvas.style.width = '100%';
        fireworksCanvas.style.height = '100%';
        fireworksCanvas.style.pointerEvents = 'none';

        const btn = document.createElement('button');
        btn.textContent = 'Novo Cadastro';
        btn.className = 'btn-submit';
        btn.style.marginTop = '12px';

        btn.addEventListener('click', () => {
            loader.style.display = 'flex';
            setTimeout(() => {
                loader.style.display = 'none';
                // limpar campos
                emailInput.value = '';
                passwordInput.value = '';
                confirmInput.value = '';
                // limpar erros visuais
                clearFieldError('email'); clearFieldError('password'); clearFieldError('confirmPassword');
                // reset de fase e armazenamento
                validationPhase = 1;
                storedEmailForPhase7 = null;
                // restaurar o elemento de requisito (recriar o HTML original se existia)
                if (!passwordRequirements && passwordRequirementsOuter && passwordRequirementsParent) {
                    passwordRequirementsParent.insertAdjacentHTML('beforeend', passwordRequirementsOuter);
                    // atualizar referências
                    passwordRequirements = document.getElementById('passwordRequirements');
                    requirementElement = passwordRequirements ? passwordRequirements.querySelector('.requirement-single') : null;
                    currentRequirementText = document.getElementById('currentRequirement');
                    // reset visual do ícone (opcional)
                    if (requirementElement) {
                        requirementElement.classList.remove('valid');
                        const icon = requirementElement.querySelector('.icon');
                        if (icon) icon.textContent = '✗';
                    }
                }
                passwordRequirements && passwordRequirements.classList.remove('show');
                updatePasswordRequirement(passwordInput.value);
                setButtonState();
                overlay.style.display = 'none';
                stopFireworks();
            }, 900);
        });

        card.appendChild(h);
        card.appendChild(btn);
        card.appendChild(fireworksCanvas);
        overlay.appendChild(card);
        document.body.appendChild(overlay);
    } else {
        overlay.style.display = 'flex';
    }

    // iniciar animação de fogos
    startFireworks();
}

// Fireworks (simples)
let fwAnimationId = null, fwCtx = null, fwParticles = [];

function startFireworks() {
    const canvas = document.getElementById('fireworksCanvas');
    if (!canvas) return;
    const card = document.getElementById('successCard');
    canvas.width = card.clientWidth;
    canvas.height = card.clientHeight;
    fwCtx = canvas.getContext('2d');
    fwParticles = [];
    for (let b = 0; b < 5; b++) createBurst(canvas.width * (0.2 + 0.6 * Math.random()), canvas.height * (0.2 + 0.6 * Math.random()));
    let ticks = 0;
    function animate() {
        ticks++;
        fwCtx.clearRect(0,0,canvas.width,canvas.height);
        for (let i = fwParticles.length -1; i >= 0; i--) {
            const p = fwParticles[i];
            p.x += p.vx; p.y += p.vy; p.vy += 0.05; p.alpha -= 0.01;
            fwCtx.globalAlpha = Math.max(0, p.alpha);
            fwCtx.fillStyle = p.color;
            fwCtx.beginPath(); fwCtx.arc(p.x,p.y,p.size,0,Math.PI*2); fwCtx.fill();
            if (p.alpha <= 0) fwParticles.splice(i,1);
        }
        fwCtx.globalAlpha = 1;
        if (ticks < 180 && fwParticles.length > 0) fwAnimationId = requestAnimationFrame(animate);
        else stopFireworks();
    }
    animate();
}

function createBurst(cx, cy) {
    const colors = ['#ff4d4f','#ffd700','#22c55e','#0ea5e9','#a78bfa','#ff7ab6'];
    const count = 24 + Math.floor(Math.random()*24);
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI*2;
        const speed = 1 + Math.random()*4;
        fwParticles.push({ x: cx, y: cy, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed * 0.7, size: 2 + Math.random()*3, color: colors[Math.floor(Math.random()*colors.length)], alpha: 0.9 });
    }
}

function stopFireworks() {
    if (fwAnimationId) { cancelAnimationFrame(fwAnimationId); fwAnimationId = null; }
    const canvas = document.getElementById('fireworksCanvas');
    if (canvas && fwCtx) fwCtx.clearRect(0,0,canvas.width,canvas.height);
    fwParticles = []; fwCtx = null;
}

// ------------------------------------------------------------------
// fim do arquivo
// ------------------------------------------------------------------