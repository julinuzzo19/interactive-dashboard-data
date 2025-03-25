# Para elegir la técnica adecuada:

✅ Paso 1: Analiza cómo varían los valores en el tiempo.
✅ Paso 2: Elige la técnica correcta según el tipo de variación (Correlacion de Pearson y promedio de crecimiento).

# Seleccionar la mejor técnica de predicción según la variación observada.

- Crecimiento estable y lineal → Regresión lineal → Si la correlación es fuerte y el crecimiento es estable.
- Crecimiento acelerado o decrecimiento rápido → Modelo exponencial → Si la correlación es fuerte y el crecimiento es alto.
- Fluctuaciones suaves o datos curvos → Interpolación de splines → Si la correlación es baja o hay muchas variaciones irregulares.

# VALORES POSIBLES DE LA API: NaN, null

<!-- Cuando se usa una tecnica u otra -->

# Corr Pearson Promedio de Crecimiento Técnica a Usar Explicación

≤ 0.7 Cualquier valor Lineal por defecto Si la correlación es baja, la relación no es clara, por lo que una curva flexible es mejor - LOGISTICA

> 0.7 / ≤ 1.1 Regresión Lineal - Si el crecimiento es estable, la mejor aproximación es lineal.
> 0.7 / > 1.1 y ≤ 1.3 y cantidad de datos es mayor a 4 - EXPONENCIAL - Crecimiento acelerado, pero predecible con una curva exponencial.
> 0.7 / > 1.1 y ≤ 1.3 y cantidad de datos es menor a 4 - LOGISTICA - Crecimiento acelerado, pero predecible con una curva exponencial - evita predicciones demasiado extremas cuando hay pocos dato
> 0.7 / > 1.3 - Crecimiento demasiado rápido - LOGISTICA - Puede estabilizarse → Se necesita flexibilidad


# investigar regresion exponencial limites prediccion en indicadores salud

predicting growth with splines
ver en chatgpt las fuentes
