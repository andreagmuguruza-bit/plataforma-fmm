from flask import Flask, send_from_directory
import os

# Configuramos Flask para que use la carpeta 'dist' que acabas de generar
app = Flask(__name__, static_folder='dist')

# Esta ruta maneja el inicio y las rutas internas de tu app de React
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    # Si el archivo existe en 'dist' (como imágenes o estilos), lo envía
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    # Si no, envía el index.html para que React tome el control
    else:
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    # Cambiamos 5000 por 5001 para evitar el bloqueo de AirPlay en Mac
    print("🚀 Plataforma FMM lista en: http://localhost:5001")
    app.run(host='0.0.0.0', port=5001, debug=True)