# INFORME

- revisar trabajo preliminar, adapratlo a lo actual
- ver fechas de informe
- info agregada son las funciones
- SUGERENCIAS a informar: FUENTE DE DATOS SECUNDARIA NO ES POSIBLE POR COMO OBTIENE LA INFO EL BANCO MUNDIAL

# Investigar

- prediccion valores, (mineria de datos area)
- progresion lineal, curvas sp, exponenciales, modelos predictivos
- usar primero progresioon lineal o ampliarlo
- libreria escala d evalores ver calculos, domiunio como se calculan los colores, para explicar en el informe, si teinee sentido usar log10 y cuadrado
- Teoria sobre correlacion de pearson y uso de regresion lineal

# Predicciones: Situaciones posibles a revisar

- Al tener un rango de solo 2 años y tenes 1 solo año
- Tener 3 años y que falten 2
- Tener 3 y que falte el primero o el ultimo en curvas SP

# TODO

- Estilizar pagina y graficos
- Optimizaciones rendimiento y procesamiento (cacheo de consultas)
- deberia Comprobar si los valores varian en ordenes de magnitud para determinar estrategia? o ya lo estoy haciendo con correlacion y promedio de crecimiento?
- probar solo valor normalizado para valores negativos
  ver si es necesario normalizar los valores min y max antes de pasarlo a dominio de chroma js
- Paises faltantes en mapa: antigua y barbuda, islas feroe
- [FEATURE] ultimo dato disponible, debe ser dato no predicho
- VER MAS EN GRAPH1 y bar chart race (al agregar mas paises se comprimen visualmente en vez de estirarse)

<!-- PRIORIDAD  -->
<!-- FILTRAR DATA DE INDICADORES QUE NO SON DE PAISES -->

get data indicator, trae datos no solamente de paises sino agregados, terminar logica aparte de los country code con 1 y x porque tambien hay ceb, css
Estados pequeos del Caribe, Estados pequeos de las Islas del Pacfico, Otros Estados pequeos, Pequeños Estados

DETECTAR SI HAY NUMEROS EN COUNTRY.ID ESOS NO VAN,

kosovo empieza con x no filtrar


<!--  -->




ver de castear a flotante los numeros

CURVAS SP, parametros (grados de libertad, flexibilidad)

enc asod e no poder usar curvas sp, coprobar si lineal (menos arriesgado)