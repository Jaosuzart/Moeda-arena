const fs = require('fs');
const path = require('path');

const filePaths = [
    'public/index.html',
    'public/admin.html',
    'src/frontend/main.js',
    'src/frontend/admin.js',
    'src/models/usuarioModel.js',
    'src/models/planoModel.js',
    'src/models/pagamentoModel.js',
    'src/controllers/adminController.js',
    'src/controllers/authController.js',
    'src/controllers/compraController.js',
    'src/controllers/gameController.js',
    'src/controllers/webhookController.js',
    'src/routes/adminRoutes.js',
    'src/routes/gameRoutes.js',
    'src/services/emailService.js',
    'scripts/setup_db.js',
    'scripts/update_db2.js',
    'scripts/update_db_reset.js'
];

const replacements = [
    // Database schema variables
    { from: /saldo_tokens/g, to: 'saldo_moedas' },
    { from: /tokens_creditados/g, to: 'moedas_creditadas' },
    
    // UI IDs & Classes
    { from: /navTokens/g, to: 'navMoedas' },
    { from: /navTokenCount/g, to: 'navMoedaCount' },
    { from: /statsTotalTokens/g, to: 'statsTotalMoedas' },
    { from: /adminTokensForm/g, to: 'adminMoedasForm' },
    { from: /adminTokenAmount/g, to: 'adminMoedaAmount' },
    { from: /nav-tokens/g, to: 'nav-moedas' },
    { from: /nav-tokens-icon/g, to: 'nav-moedas-icon' },

    // Backend functions
    { from: /adicionarTokens/g, to: 'adicionarMoedas' },
    { from: /debitarTokens/g, to: 'debitarMoedas' },
    { from: /consumirTokens/g, to: 'consumirMoedas' },
    
    // API Routes
    { from: /\/usuarios\/tokens/g, to: '/usuarios/moedas' },
    { from: /\/consumir-tokens/g, to: '/consumir-moedas' },

    // Plural Textual Replacements
    { from: /\bTokens\b/g, to: 'Moedas' },
    { from: /\btokens\b(?![-_a-zA-Z])/g, to: 'moedas' },
    { from: /\bToken\b/g, to: 'Moeda' },
    // A specific fix for the "Token Arena" or similar cases if any:
    { from: /"Token Arena"/g, to: '"Moeda Arena"' }
];

filePaths.forEach(relPath => {
    const fullPath = path.join(__dirname, '..', relPath);
    if (fs.existsSync(fullPath)) {
        let content = fs.readFileSync(fullPath, 'utf8');
        let newContent = content;
        
        replacements.forEach(rep => {
            newContent = newContent.replace(rep.from, rep.to);
        });
        
        // Let's ensure "token" (lowercase singular) is generally NOT replaced 
        // to avoid breaking "token_verificacao", "const token = ", etc.
        // The regex above only replaces Tokens, Token, and tokens.
        
        if (content !== newContent) {
            fs.writeFileSync(fullPath, newContent, 'utf8');
            console.log(`Updated: ${relPath}`);
        }
    } else {
        console.warn(`File not found: ${relPath}`);
    }
});
