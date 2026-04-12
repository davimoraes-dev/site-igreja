from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
import sqlite3
from datetime import datetime
import os
import smtplib
import threading
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

EMAIL_REMETENTE = 'ccristaumnovotempo@gmail.com'
EMAIL_SENHA = 'whqnkzspshdbntoc'
EMAIL_DESTINO = 'ccristaumnovotempo@gmail.com'

def enviar_email(assunto, corpo_html):
    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = assunto
        msg['From'] = EMAIL_REMETENTE
        msg['To'] = EMAIL_DESTINO
        msg.attach(MIMEText(corpo_html, 'html'))
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp:
            smtp.login(EMAIL_REMETENTE, EMAIL_SENHA)
            smtp.sendmail(EMAIL_REMETENTE, EMAIL_DESTINO, msg.as_string())
    except Exception as e:
        print(f'Erro ao enviar email: {e}')

app = Flask(__name__)
app.secret_key = 'comunidade-crista-um-novo-tempo-2024'

DATABASE = 'igreja.db'

def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS visitantes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            email TEXT NOT NULL,
            telefone TEXT,
            cidade TEXT,
            como_conheceu TEXT,
            mensagem TEXT,
            data_cadastro TEXT NOT NULL
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS pedidos_oracao (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            email TEXT,
            pedido TEXT NOT NULL,
            privado INTEGER DEFAULT 0,
            data_pedido TEXT NOT NULL
        )
    ''')

    conn.commit()
    conn.close()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/visitante', methods=['POST'])
def cadastrar_visitante():
    nome = request.form.get('nome', '').strip()
    email = request.form.get('email', '').strip()
    telefone = request.form.get('telefone', '').strip()
    cidade = request.form.get('cidade', '').strip()
    como_conheceu = request.form.get('como_conheceu', '').strip()
    mensagem = request.form.get('mensagem', '').strip()

    if not nome or not email:
        flash('Nome e e-mail são obrigatórios.', 'error')
        return redirect(url_for('index') + '#contato')

    conn = get_db()
    try:
        conn.execute(
            'INSERT INTO visitantes (nome, email, telefone, cidade, como_conheceu, mensagem, data_cadastro) VALUES (?, ?, ?, ?, ?, ?, ?)',
            (nome, email, telefone, cidade, como_conheceu, mensagem, datetime.now().strftime('%d/%m/%Y %H:%M'))
        )
        conn.commit()
    finally:
        conn.close()

    corpo = f"""
    <h2 style="color:#C9A84C">Novo Visitante Cadastrado</h2>
    <p><strong>Nome:</strong> {nome}</p>
    <p><strong>E-mail:</strong> {email}</p>
    <p><strong>Telefone:</strong> {telefone or 'Não informado'}</p>
    <p><strong>Cidade:</strong> {cidade or 'Não informada'}</p>
    <p><strong>Como nos conheceu:</strong> {como_conheceu or 'Não informado'}</p>
    <p><strong>Mensagem:</strong> {mensagem or 'Nenhuma'}</p>
    <hr>
    <p style="color:#888;font-size:12px">Comunidade Cristã Um Novo Tempo — Sistema do Site</p>
    """
    threading.Thread(target=enviar_email, args=(f'Novo Visitante: {nome}', corpo), daemon=True).start()

    flash('Bem-vindo(a)! Seu cadastro foi realizado com sucesso. Estamos felizes em ter você conosco!', 'success')
    return redirect(url_for('index') + '#contato')

@app.route('/oracao', methods=['POST'])
def pedido_oracao():
    nome = request.form.get('nome_oracao', '').strip()
    email = request.form.get('email_oracao', '').strip()
    pedido = request.form.get('pedido', '').strip()
    privado = 1 if request.form.get('privado') else 0

    if not nome or not pedido:
        flash('Nome e pedido são obrigatórios.', 'error')
        return redirect(url_for('index') + '#oracao')

    conn = get_db()
    try:
        conn.execute(
            'INSERT INTO pedidos_oracao (nome, email, pedido, privado, data_pedido) VALUES (?, ?, ?, ?, ?)',
            (nome, email, pedido, privado, datetime.now().strftime('%d/%m/%Y %H:%M'))
        )
        conn.commit()
    finally:
        conn.close()

    privacidade = 'Privado (apenas liderança)' if privado else 'Público'
    corpo = f"""
    <h2 style="color:#C9A84C">Novo Pedido de Oração</h2>
    <p><strong>Nome:</strong> {nome}</p>
    <p><strong>E-mail:</strong> {email or 'Não informado'}</p>
    <p><strong>Privacidade:</strong> {privacidade}</p>
    <p><strong>Pedido:</strong></p>
    <blockquote style="border-left:4px solid #C9A84C;padding:12px;background:#f9f9f9">{pedido}</blockquote>
    <hr>
    <p style="color:#888;font-size:12px">Comunidade Cristã Um Novo Tempo — Sistema do Site</p>
    """
    threading.Thread(target=enviar_email, args=(f'Pedido de Oração: {nome}', corpo), daemon=True).start()

    flash('Seu pedido de oração foi recebido. Vamos orar por você!', 'success')
    return redirect(url_for('index') + '#oracao')

@app.route('/contribuir')
def contribuir():
    return render_template('contribuir.html')

@app.route('/admin')
def admin():
    conn = get_db()
    visitantes = conn.execute('SELECT * FROM visitantes ORDER BY id DESC').fetchall()
    oracoes = conn.execute('SELECT * FROM pedidos_oracao ORDER BY id DESC').fetchall()
    conn.close()
    return render_template('admin.html', visitantes=visitantes, oracoes=oracoes)

if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)), debug=False)
