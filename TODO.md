# OPCIONAL

- (OPCIONAL)datawarehouse bvase de datos con tablas preparado para consultas (herramiento de apache kylin). hacerlo de forma directa o capa intermedia ? si son pocas consltas de forma directa o con mucha flexibilidad capa intermedia

- Cada cuanto tiempo se suele hacer la obtencion de datos, deberia ser un script que se ejecute periodicamente, o estas herramientas proveen esta funcionalidad de ejecutarlo automaticamente

##

# TODO

- libreria de graficos en mapas : Highcharts Maps -> highcharts-react-official -> ![ejemplo mapa](image.png)

- paginacion en consulta de indicadores, debounce al buscar indicadores especificos
- LIMITAR INDICADORES DEL AREA DE SALUD

<!-- FILTROS -->

- indicadores
- regiones - paises
- años
<!--  -->

##

# 12-11

con que tipo de datos voy a trabajar

- Graficos principales:
  1- mapa
  2- graficosde barras horizontlaes

- mencionar en informe:

1 distintos graficos en dashboard
2 filtros de fecha
3 informacion agregada

- optimizacion arriba de documentacion

-Ver en su momento si vamos a necesitar consumir data en una capa intermedia para reducir consumo de api

-documentacion: de como correr el proyecto y su uso en el README

Reunion con sebastian cada 2 semanas

- Terminar informe preliminar
  1 agregar dato de tutores
  2 al enviar informe preliminar, se comunicara con un tutor de apoyo a desarrollo texto (marco teorico, etc)

##

# 5-12

<!-- Investigación de la API -->

- Al investigar sobre traducir al español los indicadores, descubri que la API posee la funcionalidad de traducir la informacion
- La API permite filtrar los indicadores por topicos, en este caso utilizaremos el de salud
- Tooltip con datos sobre cada pais al pasar el mouse sobre el mapa
- Modificando fuente de datos de paises en el mapa, traduciendo nombres y agregando continente
- Logica de seleccionar indicador y obtener valores por paises
- Filtro por año
- Busqueda de indicador por nombre o codigo

# TODO

- Logica de pintar color en el mapa dependiendo el indicador seleccionado
- ESTILIZAR Y AGREGAR DATOS AL TOOLTIP
- Decidir graficos a utilizar
- Decidir si usar filtro por año o intervalo de tiempo
- Definir los años que se tienen datos en la API
- agregar escala de valores de color (itnensidad)
- agrupar indicadores por topicos
- feature noticias/notas sobre indicador seleccionado

##

# 16-12

# AVANCES

- Decidir si usar filtro por año o intervalo de tiempo
- Definir los años que se tienen datos en la API

# 20-12

# DONE

logica de color por mapas

# VER

- al consultar indicador, cargar fechas de datos disponibles dinamicamente dependiendo datos disponibles del indicador
- que todos los indicadores tengan sentido con la escala de colores

# CONSULTAS

- Si se usa un rango de fechas, y un año no tiene datos, deberia promediar el valor del pais o como hacerlo?
- Utilizar api secudnaria en caso d eno tener datos sobre paises de el indicador seleccionado

# 24-12

## TODO

- Al cambiar de vista, los colores de mapa se rompen

# DONE

- grafico barras horizontales

# 26-12

# DONE

- FIX rerender function color map error
- fix tooltip and hover mapa

## TODO

- agrandar texto eje y grafico horizontal
- achicar mapa
- VOLVER A HACER topojson con continentes
- agregar un grafico principal mas

<!-- CONSULTAR -->

- Si se usa un rango de fechas, y un año no tiene datos, deberia promediar el valor del pais o como hacerlo?
- Utilizar api secudnaria en caso d eno tener datos sobre paises de el indicador seleccionado
