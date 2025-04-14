# **Plan de Desarrollo del Producto Mínimo Viable (MVP): \[Nombre Provisional del Juego\]**

Basado en el GDD v0.2 \- Sección 8 (Alcance del Proyecto y Planificación)

## **Objetivo del MVP**

El propósito de este MVP es construir la versión más básica y funcional del juego que permita:

1. **Validar la Mecánica Central de Magia Rúnica:** Probar si el sistema de dibujo/combinación de runas adaptado a PC es intuitivo, funcional y divertido.  
2. **Validar la Sinergia Héroe-Magia-Monstruos:** Comprobar si la interacción entre controlar directamente al Héroe, lanzar hechizos activamente y comandar un pequeño grupo de monstruos resulta una experiencia de juego atractiva.  
3. **Probar la Viabilidad Técnica:** Asegurar que los elementos técnicos clave (especialmente el sistema de runas en Three.js) son realizables.  
4. **Obtener Feedback Temprano:** Recoger opiniones sobre el *core loop* antes de invertir recursos significativos en contenido y sistemas secundarios.

## **Alcance del MVP (Características INCLUIDAS)**

Siguiendo la Sección 8 del GDD y enfocándonos en lo esencial:

* **Héroe:**  
  * 1 tipo de Héroe Mago controlable.  
  * Atributos básicos: HP, Maná.  
  * Movimiento y ataque básico (puede ser débil o inexistente, enfocándose en hechizos).  
  * Habilidad de 'Capturar Monstruo' funcional (versión simple).  
* **Sistema de Maná:**  
  * Recurso de Maná para el Héroe.  
  * Regeneración pasiva simple.  
  * Coste de Maná para hechizos.  
* **Sistema de Magia y Runas:**  
  * **Implementación funcional del método elegido (dibujo/selección) para PC.**  
  * Un conjunto limitado de Runas básicas (ej: 3-5 runas como Fuego, Agua, Proyectil, Área, Escudo).  
  * Un número limitado de Hechizos combinados (ej: 5-10 hechizos resultantes de las runas básicas, como Bola de Fuego, Chorro de Agua, Escudo Simple, Curación Pequeña).  
  * Interfaz de usuario (UI) básica para dibujar/seleccionar runas y ver hechizos disponibles/combinados.  
* **Sistema de Monstruos:**  
  * Un número limitado de tipos de monstruos capturables (ej: 3-5 tipos distintos con roles básicos: tanque simple, atacante melee, atacante ranged).  
  * Monstruos aparecen en el mapa como neutrales/salvajes.  
  * Habilidad de Captura funcional (ej: requiere que el monstruo tenga poca vida, consume Maná y tiempo).  
  * Comando básico de monstruos capturados (seleccionar, mover, atacar objetivo).  
  * Límite de control de monstruos simple y fijo (ej: el Héroe puede controlar máximo 3 monstruos a la vez).  
* **Combate:**  
  * Interacción básica de daño/HP entre Héroe, monstruos aliados y monstruos enemigos/salvajes.  
  * Los hechizos del Héroe infligen daño o aplican efectos simples.  
* **Mundo y Contenido:**  
  * 1 Mapa de juego pequeño y simple.  
  * Incluir algunas zonas donde aparezcan monstruos salvajes (Guaridas).  
  * Opcional: 1 Fuente de Maná que aumente ligeramente la regeneración si el Héroe está cerca.  
* **IA:**  
  * IA enemiga muy básica: Monstruos salvajes/enemigos atacan al Héroe o sus monstruos si entran en su rango de agresión. No hay tácticas complejas.  
* **Condición de Victoria/Fin:**  
  * Simple: "Matar a todos los monstruos enemigos/salvajes en el mapa" (como en GDD 2.10). No hay base enemiga ni Héroe enemigo.  
* **UI/UX:**  
  * HUD esencial: Mostrar HP y Maná del Héroe.  
  * Interfaz de Runas/Hechizos.  
  * Panel simple para ver los monstruos controlados (iconos, HP básico).  
  * Feedback visual/sonoro mínimo para acciones clave (lanzar hechizo, capturar, recibir daño).  
* **Arte y Sonido:**  
  * Usar arte placeholder o muy simplificado. El foco es la funcionalidad, no la estética final.  
  * SFX básicos para claridad. Sin música o con música placeholder.  
* **Plataforma:** PC (Navegador con Three.js).

## **Plan de Desarrollo del MVP (Fases Enfocadas)**

### **Fase 1: Núcleo \- Héroe y Sistema de Runas (Duración estimada: A semanas)**

* **Tareas:**  
  * Configuración inicial del proyecto en Three.js.  
  * Implementar cámara isometrica para ver al hereo, otros magos y monstruos.  
  * Implementar movimiento y atributos básicos del Héroe (HP, Maná, regeneración).  
  * **Desarrollar y testear intensivamente la interfaz y lógica del sistema de Runas/Hechizos elegido.** Incluir las 3-5 runas y 5-10 hechizos del MVP.  
  * Implementar el coste de Maná para los hechizos.  
  * Crear la UI básica para las runas y el HUD de HP/Maná.  
* **Meta:** Tener al Héroe moviéndose y lanzando el set de hechizos del MVP mediante la mecánica de runas definida. **Validar la usabilidad del sistema de runas.**

### **Fase 2: Expansión \- Monstruos y Combate (Duración estimada: B semanas)**

* **Tareas:**  
  * Crear los 3-5 tipos de monstruos del MVP (modelo simple, stats básicos, ataque básico).  
  * Implementar la aparición de monstruos salvajes en el mapa.  
  * Implementar la habilidad 'Capturar Monstruo' (lógica simple).  
  * Implementar el sistema de comando de monstruos (selección, órdenes básicas).  
  * Implementar el límite de control de monstruos.  
  * Desarrollar la lógica de combate básica (daño, HP).  
  * Crear la IA enemiga simple (agresión por proximidad).  
  * Implementar la UI básica para mostrar monstruos controlados.  
* **Meta:** Poder capturar monstruos y usarlos en combate junto al Héroe contra enemigos básicos, utilizando los hechizos implementados. **Validar la sinergia Héroe-Magia-Monstruos.**

### **Fase 3: Integración y Contexto (Duración estimada: C semanas)**

* **Tareas:**  
  * Diseñar e implementar el mapa simple del MVP.  
  * Colocar las guaridas de monstruos y la fuente de maná (opcional).  
  * Implementar la condición de victoria/fin del MVP ("Matar a todos").  
  * Integrar todos los sistemas: Héroe, magia, monstruos, combate, IA, entorno.  
  * Añadir SFX básicos y feedback visual esencial.  
  * Crear un texto introductorio o pop-ups muy simples explicando los controles básicos (mini-tutorial).  
* **Meta:** Tener un bucle de juego completo y jugable dentro del alcance del MVP, desde el inicio hasta la condición de victoria.

### **Fase 4: Pruebas y Pulido del MVP (Duración estimada: D semanas)**

* **Tareas:**  
  * Realizar pruebas internas exhaustivas para identificar bugs críticos y problemas de usabilidad.  
  * Corregir los bugs encontrados.  
  * Realizar ajustes mínimos de balance (costes de maná, daño/HP) para asegurar que el MVP sea jugable y no excesivamente frustrante o trivial.  
  * Asegurar que el flujo del mini-tutorial sea claro.  
* **Meta:** Un MVP estable, funcional y listo para ser probado por un grupo reducido (o internamente) para validar las hipótesis centrales.

## **Características EXCLUIDAS del MVP (Recordatorio)**

* Progresión del Héroe (niveles, aprendizaje de runas/habilidades).  
* Unidades civiles AoE, construcción, recolección de recursos estándar.  
* Sistema de comercio.  
* Evolución/mejoras de monstruos, Bestiario.  
* Gran variedad de monstruos, hechizos, runas.  
* Afinidades elementales, sistema de counters complejo.  
* IA avanzada, formaciones.  
* Múltiples mapas, modos de juego (solo 1 mapa skirmish simple vs IA básica).  
* Arte y sonido finales/pulidos.  
* Optimización de rendimiento detallada.  
* Multijugador.  
* Historia/Lore in-game.  
* Equipamiento para el Héroe.  
* Estructuras mágicas complejas.

## **Siguientes Pasos tras el MVP**

Una vez completado y probado el MVP:

1. **Analizar Resultados:** ¿Funcionó la mecánica de runas? ¿Es divertida la sinergia? ¿Es técnicamente viable?  
2. **Recopilar Feedback:** Obtener opiniones detalladas de los testers.  
3. **Decidir:**  
   * **Pivotar:** Si el core no funciona, rediseñar las mecánicas centrales.  
   * **Perseverar:** Si el core funciona, usar el feedback para planificar la siguiente fase de producción (ej: Vertical Slice o Producción Plena), añadiendo más contenido y sistemas gradualmente.  
   * **Abandonar:** Si el concepto no demuestra ser viable o divertido.

Este plan enfocado en el MVP te permitirá probar tu idea central de forma rápida y eficiente. ¡Mucha suerte con el desarrollo\!