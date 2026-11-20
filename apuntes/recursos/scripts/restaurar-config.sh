#!/bin/bash
# --- SCRIPT PARA RESTAURAR LA CONFIGURACIÓN DE GIT Y SSH ---
# Uso (Git Bash):  bash restaurar-config.sh
# Copia la configuración guardada (por defecto en D:/git_backup) de vuelta a tu carpeta de usuario.
# Para usar otra carpeta:  BACKUP_DIR="E:/mi_backup" bash restaurar-config.sh

echo "==================================================="
echo "Restaurando la configuración de Git y SSH..."
echo "==================================================="

# Directorio de origen (se puede cambiar con la variable BACKUP_DIR)
BACKUP_DIR="${BACKUP_DIR:-D:/git_backup}"

# Comprueba si el directorio de backup existe antes de continuar
if [ ! -d "$BACKUP_DIR" ]; then
    echo "ERROR: ¡El directorio de backup $BACKUP_DIR no existe!"
    echo "Asegúrate de haber guardado la configuración al menos una vez."
    exit 1
fi

# Restaura el archivo de configuración global de Git
if [ -f "$BACKUP_DIR/.gitconfig" ]; then
    echo "1. Encontrado .gitconfig en el backup. Restaurando a ~/.gitconfig..."
    cp "$BACKUP_DIR/.gitconfig" ~/
    echo "   ...Restauración de .gitconfig completada."
else
    echo "1. ADVERTENCIA: No se encontró .gitconfig en el backup."
fi

# Restaura la carpeta de configuración de SSH
if [ -d "$BACKUP_DIR/.ssh" ]; then
    echo "2. Encontrada carpeta .ssh en el backup. Restaurando a ~/.ssh..."
    cp -rf "$BACKUP_DIR/.ssh" ~/
    echo "   ...Restauración de .ssh completada."
else
    echo "2. ADVERTENCIA: No se encontró la carpeta .ssh en el backup."
fi

echo "==================================================="
echo "¡Restauración finalizada!"
echo "Comprueba:  git config --global user.name   y   ssh -T git@github.com"
echo "==================================================="
