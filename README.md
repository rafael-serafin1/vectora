What is Vectora? 
--------------
Vectora is a declarative DSL project focused on orchestrating animations, designed specifically for the web-oriented frontend development ecosystem.

What it solves
--------------
Many JS animations become hard to maintain due to imperative state management and scattered event handlers.  
Vectora provides a declarative syntax to describe animations in a structured, readable DSL, reducing boilerplate and cognitive load.

Getting Started
---------------
***Clone Repository:*** <br>
git clone https://github.com/RafaelEngel10/vectora.git <br>
cd vectora <br>

***Install Dependencies:***<br>
npm install <br>

***Run build:***<br>
npm run build <br>

### Grammar Example

Create `example.vec`:
```
h1 {
    window.onLoad {
        text: land(600ms);
    };
}
```

Add to `index.html`:
```
<*link* rel="vectora" href="example.vec">
<*script* src="./vectora/src/interpreter.js">
```

> EXPECTED OUTPUT -> on window page fully loaded, h1 will fall and land in 600ms. 
#### More info about it in our documentation.

Syntax Breakdown
---
```
div {                                                          <--- HTML element/class/id
    window.onLoad {                                             <--- Animation Trigger Event
        background.color: fadeIn(#fff00, 600ms);                  <--- Property: Animation function
    };
}
```

Status
------
✅ Current: sum/concat animations, interpolation manipulation and properties, concat manual delay, inversor.<br   >
🏗️ In progress: async elements/events. <br > 
📜 Planned: counter statement, identifier.

Contributing
------------
1. Open an issue
2. Fork and branch
3. Make changes + tests
4. Open pull request
