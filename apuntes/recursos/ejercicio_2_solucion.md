# Estación meteorológica del aula

![Logo del Centro San Luis](img/logo-centro-san-luis.jpg)

Proyecto de **1º de Bachillerato** para medir la *temperatura*, la *humedad* y la *presión* del patio y publicar los datos en una web. El código está en GitHub: [ver repositorio](https://github.com/usuario/estacion-meteo).

> **Aviso:** los sensores funcionan a 3,3 V. Conectarlos a 5 V puede dañarlos.

## Componentes

| Componente | Cantidad | Precio aprox. |
|:---|:---:|---:|
| Placa ESP32 | 1 | 8,50 € |
| Sensor BME280 | 1 | 4,20 € |
| Cables dupont | 10 | 1,00 € |

## Instalación

1. Clona el repositorio.
2. Abre la carpeta en **VS Code**.
3. Sube el programa `estacion.ino` a la placa.

```bash
git clone https://github.com/usuario/estacion-meteo.git
cd estacion-meteo
```

## Estado del proyecto

- [x] Montar el circuito
- [x] Leer la temperatura
- [ ] Guardar los datos en el archivo `datos.csv`
- [ ] Publicar la web con GitHub Pages

Descartado: ~~usar un sensor DHT11~~ (sustituido por el BME280, más preciso).

## Equipo

- **Hardware:** Ane y Mikel
  - Montaje y cableado
  - Pruebas de los sensores
- **Software:** Lucía
- **Documentación:** todo el grupo

---

*Última actualización: noviembre de 2026*
