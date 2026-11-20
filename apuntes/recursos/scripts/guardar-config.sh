#!/bin/bash
# --- SCRIPT PARA GUARDAR LA CONFIGURACIÓN DE GIT Y SSH ---
# Uso (Git Bash):  bash guardar-config.sh
# Copia ~/.gitconfig y ~/.ssh/ a una carpeta de un disco que NO se borra (por defecto D:/git_backup).
# Para usar otra carpeta:  BACKUP_DIR="E:/mi_backup" bash guardar-config.sh

echo "================================================="
echo "Iniciando copia de seguridad de Git y SSH..."
echo "================================================="

# Directorio de destino (se puede cambiar con la variable BACKUP_DIR)
BACKUP_DIR="${BACKUP_DIR:-D:/git_backup}"

# Crea el directorio de backup si no existe (-p evita errores si ya existe)
echo "1. Asegurando que el directorio de destino existe en $BACKUP_DIR..."
mkdir -p "$BACKUP_DIR" || { echo "ERROR: no se pudo crear $BACKUP_DIR"; exit 1; }
echo "   ...Directorio listo."

# Copia el archivo de configuración global de Git
if [ -f ~/.gitconfig ]; then
    echo "2. Encontrado .gitconfig. Copiando a $BACKUP_DIR..."
    cp ~/.gitconfig "$BACKUP_DIR/"
    echo "   ...Copia de .gitconfig completada."
else
    echo "2. ADVERTENCIA: No se encontró el archivo ~/.gitconfig."
fi

# Copia la carpeta de configuración de SSH de forma recursiva
if [ -d ~/.ssh ]; then
    echo "3. Encontrada carpeta .ssh. Copiando a $BACKUP_DIR..."
    # -r: recursivo · -f: sobrescribe si ya existe
    cp -rf ~/.ssh "$BACKUP_DIR/"
    echo "   ...Copia de .ssh completada."
else
    echo "3. ADVERTENCIA: No se encontró la carpeta ~/.ssh."
fi

echo "================================================="
echo "¡Copia de seguridad finalizada con éxito!"
echo "Tus archivos están a salvo en $BACKUP_DIR"
echo "================================================="
