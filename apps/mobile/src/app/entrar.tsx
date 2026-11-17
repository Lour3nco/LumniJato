import { useState } from 'react';
import { KeyboardAvoidingView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BotaoGrande } from '../componentes';
import { useSessao } from '../sessao/ProvedorDeSessao';
import { cores, fontes, medidas } from '../tema';

/**
 * TELA-13 · Entrar (FIN-US-01.7). Só e-mail e senha; a conta é criada pela equipe, então não
 * há "criar conta" (ST-07). O app fica conectado até o dono sair (RNF-04).
 */
export default function TelaEntrar() {
  const { entrar, estado, sessao } = useSessao();
  const reautenticando = estado === 'reautenticar';
  const [email, setEmail] = useState(reautenticando ? (sessao?.email ?? '') : '');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [entrando, setEntrando] = useState(false);

  const podeEntrar = email.trim() !== '' && senha !== '' && !entrando;

  async function aoEntrar() {
    setErro(null);
    setEntrando(true);
    try {
      const resultado = await entrar(email, senha);
      if (!resultado.ok) setErro(resultado.mensagem);
    } finally {
      setEntrando(false);
    }
  }

  return (
    <SafeAreaView style={estilos.tela}>
      <KeyboardAvoidingView behavior="height" style={estilos.tela}>
        <ScrollView contentContainerStyle={estilos.conteudo} keyboardShouldPersistTaps="handled">
          <Text accessibilityRole="header" style={estilos.titulo}>
            Entrar
          </Text>
          {reautenticando ? (
            <Text accessibilityRole="alert" style={estilos.aviso}>
              Sua sessão na nuvem expirou. Entre de novo para continuar enviando. Os lançamentos
              guardados no celular continuam aqui.
            </Text>
          ) : (
            <Text style={estilos.texto}>Use o e-mail e a senha que a equipe passou para você.</Text>
          )}

          <View style={estilos.campo}>
            <Text nativeID="rotulo-email" style={estilos.rotulo}>
              E-mail
            </Text>
            <TextInput
              accessibilityLabel="E-mail"
              accessibilityLabelledBy="rotulo-email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="username"
              style={estilos.entrada}
            />
          </View>

          <View style={estilos.campo}>
            <Text nativeID="rotulo-senha" style={estilos.rotulo}>
              Senha
            </Text>
            <TextInput
              accessibilityLabel="Senha"
              accessibilityLabelledBy="rotulo-senha"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="current-password"
              textContentType="password"
              onSubmitEditing={() => podeEntrar && void aoEntrar()}
              style={estilos.entrada}
            />
          </View>

          {erro ? (
            <Text accessibilityRole="alert" accessibilityLiveRegion="assertive" style={estilos.erro}>
              {erro}
            </Text>
          ) : null}

          <BotaoGrande
            rotulo={entrando ? 'Entrando…' : 'Entrar'}
            rotuloAcessivel="Entrar"
            aoTocar={() => void aoEntrar()}
            desabilitado={!podeEntrar}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { flexGrow: 1, justifyContent: 'center', padding: medidas.margemTela, gap: 16 },
  titulo: { fontSize: 28, fontWeight: 'bold', color: cores.texto },
  texto: { fontSize: fontes.corpo, color: cores.textoSecundario },
  aviso: {
    fontSize: fontes.corpo,
    color: cores.ambar,
    backgroundColor: cores.fundoAmbar,
    padding: 12,
    borderRadius: medidas.raio,
  },
  campo: { gap: 4 },
  rotulo: { fontSize: fontes.corpo, color: cores.texto, fontWeight: 'bold' },
  entrada: {
    minHeight: medidas.toqueMinimo,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: medidas.raio,
    paddingHorizontal: 12,
    fontSize: fontes.corpo,
    color: cores.texto,
  },
  erro: {
    fontSize: fontes.corpo,
    color: cores.ambar,
    backgroundColor: cores.fundoAmbar,
    padding: 12,
    borderRadius: medidas.raio,
  },
});
