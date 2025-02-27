# INFORME

- revisar trabajo preliminar, adapratlo a lo actual
- ver fechas de informe
- info agregada son las funciones
- SUGERENCIAS a informar: FUENTE DE DATOS SECUNDARIA

# Investigar

- prediccion valores, (mineria de datos area)
- progresion lineal, curvas sp, exponenciales, modelos predictivos
- usar primero progresioon lineal o ampliarlo
- libreria escala d evalores ver calculos, domiunio como se calculan los colores, para explicar en el informe, si teinee sentido usar log10 y cuadrado
- Teoria sobre correlacion de pearson y uso de regresion lineal, con un modulo de 0.7

# Predicciones: Situaciones posibles

- Al tener un rango de solo 2 años y tenes 1 solo año
- Tener 3 años y que falten 2
- Tener 3 y que falte el del medio, el primero o el ultimo

# Preguntas

- Si tengo solo 2 valores y el dato de uno, deberia buscar datos de otros valores en la API? actualmente trae resultados de 10 años antes y despues a la fehca seleccionada para los calculos predictivos
- Una vez predicho un valor de indicador de un año en un pais, si necesito predecir otro valor de indicador de otro año del mismo pais, deberia utilizar el dato de la prediccion anterior para la nueva?
- Donde investigar en que limites se deberia elegir una tecnica u otra (coeficiente pearson, promedio de crecimiento > 1.05)

- al usar regresion exponencial, si el crecimiento es muy alto me da infinito, en ese caso utilizaria curvas sp?

- en caso de que "El valor del año a predecir está fuera del rango de los datos históricos." que tecnica utilizaria?

# TODO

- SUITUACIONES DE CUANDO UN VALOR NOE XISTE, IONTERMEDIO O FINAL O INICIAL
- en caso de que "El valor del año a predecir está fuera del rango de los datos históricos." que tecnica utilizaria?
- Ver de cachear consultas para no reperielas

- deberia Comprobar si los valores varian en ordenes de magnitud para determinar estrategia?
- probar solo valor normalizado para valores negativos
  ver si es necesario normalizar los valore smin y max antes de pasarlo a dominio d echroma js

- Paises faltantes en mapa: antigua y barbuda, islas feroe
- Selector de paises faltantes