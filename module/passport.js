// module/passport.js

const conecao = require('./db');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

module.exports = (passport) => {
    // Configurando a estratégia de autenticação local
    passport.use(new LocalStrategy(
        async (username, password, done) => {
            try {
                // Busca o usuário no banco de dados
                const [resultado] = await conecao.query(`SELECT * FROM [nome da sua tabela] WHERE nome = ?`, [username]);

                // Se o usuário não existir
                if (resultado.length === 0) {
                    return done(null, false, { message: 'Esta conta não existe' });
                }

                // Compara a senha fornecida com a senha armazenada
                const user = resultado[0];
                const match = await bcrypt.compare(password, user.senha); // A senha armazenada deve ser hash

                if (match) {
                    return done(null, user); // Autenticação bem-sucedida
                } else {
                    return done(null, false, { message: 'Senha errada.' }); // Senha incorreta
                }
            } catch (error) {
                return done(error); // Erro no banco de dados
            }
        }
    ));

    // Serializa o usuário para a sessão
    passport.serializeUser((user, done) => {
        done(null, user.id); // Armazena apenas o ID do usuário na sessão
    });

    // Deserializa o usuário a partir do ID armazenado na sessão
    passport.deserializeUser(async (id, done) => {
        try {
            const [resultado] = await conecao.query(`SELECT * FROM [nome da sua tabela] WHERE id = ?`, [id]);
            done(null, resultado[0]); // Retorna os detalhes do usuário
        } catch (error) {
            done(error); // Erro ao recuperar o usuário
        }
    });
};
