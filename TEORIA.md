<!-- # Fuente de base de datos WDI -->

- Los datos provienen de una gran variedad de fuentes, internas, externas y son compartidas con otros organismos

## Fuentes internas

- Datos recopilados de proyectos propios, encuestas

## Fuentes externas

- ONU
- Gobiernos de paises
- Bancos de desarrollo regionales
- Instituciones de investigacion

- https://datos.bancomundial.org/quienes-somos

<!-- Dominio colores mapa -->

- Utilizados para normalizar la escala del dominio de colores y comprimir los colores para que la escala sea mas facil de observar
- Sin estas transformaciones, los valores extremadamente grandes podrían dominar la escala de colores, haciendo que los valores más pequeños parezcan todos iguales.

# Uso de logaritmo para valores mayores a 1

- Usado para indicadores que pueden variar en magnitudes en distintos paises
- Valores menores a 1, dan negativo y el dominio de colores espera valores positivos

- [1, 10, 100, 1000] se transforman en [0, 1, 2, 3]

# Uso de sqrt para valores menores a 1

- Normalizacion menos agresiva para valores que no varian tanto en ordenes de magnitud
-
- [1, 10, 100, 1000] se transforman en [1, 3.16, 10, 31.62]
