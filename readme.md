<h1 align="center">
 ❄️ Transfer Elements ❄️
</h1>

![Cover](./assets/cover.png)

<p align="center">
  <a>
    <img src="https://img.shields.io/github/created-at/sineylo/transfer-elements?style=for-the-badge&logo=github&labelColor=%232E3440&color=%23D8DEE9" alt="GitHub created at">
  </a>
  <a>
    <img src="https://img.shields.io/npm/dw/transfer-elements?style=for-the-badge&logo=npm&labelColor=%232E3440&color=%23D8DEE9" alt="NPM downloads">
  </a>
  <a>
    <img src="https://img.shields.io/bundlejs/size/transfer-elements?style=for-the-badge&logo=npm&labelColor=%232E3440&color=%23D8DEE9" alt="NPM package minimized gzipped size">
  </a>
</p>

<p align="center">
  <strong>The future belongs to those who are preparing for it today. (Malcolm X)</strong>
</p>

<p align="center">
  <a href="./readme-ru.md">Documentation in Russian</a>
</p>

## ![Navigation](./assets/navigation-section-en.png)

- [Description](#description)
- [Advantages](#advantages)
- [Installation](#installation)
- [Connection](#connection)
- [Usage](#usage)
- [Parameters](#parameters)
- [Browser compatibility](#browser-compatibility)
- [Community](#community)

<h2 id="description">
  <img src="./assets/description-section-en.png" alt="Description">
</h2>

“Transfer Elements” — a library that allows you to dynamically transfer any elements from one place to another on breakpoints.

### Why might this be necessary?

Let's imagine that the designer initially prepared a layout only for computers, in which there is a complex header consisting of several rows. In one of these rows there is an input field for searching for products and some other elements. After some time, the designer starts designing the first layout for the adaptive and realizes that the search field does not have enough space and decides to move it to a more free row.

As developers, we need to solve this problem somehow, and without using JS, there are two options that are not very good.

The first — to duplicate the markup. The disadvantage of this method is that the code is bloated. And okay, if you need to move one `<div>`, but if the whole section? In addition, the element may have an `id` attribute, then it will also have to be changed, since there cannot be two identical `id` in the markup.

The second — to use absolute positioning. This option seems good, but in fact it is even worse, as it breaks accessibility. Yes, visually the element will be where we need it, bun in the `DOM` it will remain in the same place. And screen readers overwhelmingly focus on the `DOM` rather than the visual location, because it can be anything.

So the library **solves** this problem. It just “takes” an element from the `DOM` and moves it to where you need it. At the same time, there is no duplication in the markup or the use of absolute positioning.

---

The main **purpose** of this library — to give freedom for web designers to create. I believe that they should not adapt to us, but we should adapt to them. The more tools that allow us to implement their ideas begin to appear, the faster we will come to a point where each site will look modern, and most importantly, it will be convenient to use from any device.

<h2 id="advantages">
  <img src="./assets/advantages-section-en.png" alt="Advantages">
</h2>

- **Without dependencies**. All the code is written from scratch and there are no third-party solutions.
- **Innovative technology**. The library is based on own technology “Transfer Elements Simulation” (TES). Thanks to it, the sequential transfer (lifting the entire breakpoint chain) is performed only once.
- **Multiple transfer**. The maximum number of breakpoints is unlimited. Add as many of them as required for your project.
- **Two-step data validation**. A wide variety of user data checks have been added to the library. At the first stage, the data is checked for compliance with the required type. After that, the second stage begins and the possibility of inserting into the target element is checked. There is also an additional check for rare cases built into TES. If something goes wrong, you will receive a detailed error message.
- **Accessibility**. Breakpoints have no connection to any CSS units of measurement. Despite the fact that there is some similarity to pixels (`px`), all the library code works with a regular number. Therefore, when you change the font settings in the browser, nothing will break.
- **Speed**. In addition to raising the entire breakpoint chain once, the search for the breakpoint itself, at the time of the main transfer, is performed in logarithmic time `O(log n)`.

<h2 id="installation">
  <img src="./assets/installation-section-en.png" alt="Installation">
</h2>

> [!IMPORTANT]
> If you don't use modules or you do, but you want to import not from `node_modules`, skip this section and move on to the next one.

Depending on the package manager you are using, select a command and run it in the terminal.

```
npm install transfer-elements
```

```
yarn add transfer-elements
```

<h2 id="connection">
  <img src="./assets/connection-section-en.png" alt="Connection">
</h2>

### Modules

If you have installed the library, you can import it from `node_modules`.

```JS
import TransferElements from 'transfer-elements';
```

If you haven't installed the library, you can import it from the CDN.

```JS
import TransferElements from 'https://cdn.jsdelivr.net/npm/transfer-elements@1.0.5/dist/transfer-elements.esm.min.js'
```

### Tag \<script\>

Just like with modules, you can use CDN if you wish.

```HTML
<script src="https://cdn.jsdelivr.net/npm/transfer-elements@1.0.5"></script>
```

The link is shorter than for modules because the file is requested by default `transfer-elements.min.js `. Anyway, you can specify the full link.

```HTML
<script src="https://cdn.jsdelivr.net/npm/transfer-elements@1.0.5/dist/transfer-elements.min.js"></script>
```

### Other

If all of the above options are not suitable for any reason, you can [download the files](https://registry.npmjs.org/transfer-elements/-/transfer-elements-1.0.5.tgz) and connect the library the way you need.

<h2 id="usage">
  <img src="./assets/usage-section-en.png" alt="Usage">
</h2>

> [!NOTE]
> A fairly large number of checks have been added to the library. This is necessary in order for the main mechanism to receive only the correct data. Therefore, even if you do something wrong, you will see an error in DevTools in the console section.

The first thing you need to do after connecting is to call the constructor.

```JS
new TransferElements();
```

It accepts a set of `{}` objects with parameters. That is, you can specify either one object or several if you need to transfer different elements. For example, I will specify only one.

```JS
new TransferElements(
  {

  }
);
```

After that, we will add the first and perhaps the most important parameter to the object — `sourceElement`. This is an element that will be moved to other elements or to the same one, but with a changed position, on breakpoints, which we will specify later.

Since the value of this parameter must be an object of type `Element`, you can use any method that returns such a value. I use `document.getElementById()` most often, so I'll use it.

```JS
new TransferElements(
  {
    sourceElement: document.getElementById('id-1')
  }
);
```

> [!TIP]
> If you need to move several elements, then you can specify objects with them in any order. The mechanism will adjust the insertion order itself, based on the order of these elements in the DOM.

Then add the `breakpoints` parameter, the value of which should be an object of type `Object`. It will store all the breakpoints where the `sourceElement` should be moved.

```JS
new TransferElements(
  {
    sourceElement: document.getElementById('id-1'),
    breakpoints: {

    }
  }
);
```

> [!TIP]
> The library is based on the `Desktop First` approach. This means that the transfer of elements will be carried out from a larger breakpoint to a smaller one. But despite this, you can specify breakpoints in any order.

The breakpoint itself consists of a trigger of type `string`, that is, a key, and an object of type `Object`, which is a value. As a trigger, you can specify almost any value that can be converted to a number, except zero (assuming it's an integer), negative numbers, and numbers beyond `Number.MAX_SAFE_INTEGER`. Now I will add a random breakpoint `990`.

```JS
new TransferElements(
  {
    sourceElement: document.getElementById('id-1'),
    breakpoints: {
      990: {

      }
    }
  }
);
```

Next, in the breakpoint object, you need to specify the `targetElement` parameter. Its value should be the same as that of `sourceElement` — an object of type `Element`. This parameter is responsible for the element to which the `sourceElement` should be moved. By analogy with `sourceElement` I will use the `document.getElementById()` method.

```JS
new TransferElements(
  {
    sourceElement: document.getElementById('id-1'),
    breakpoints: {
      990: {
        targetElement: document.getElementById('id-2')
      }
    }
  }
);
```

If you did everything correctly and no errors appeared at this stage, then switching to the breakpoint you specified, you will see that the `sourceElement` has moved to the `targetElement` and is in the zero position. The account starts from zero, and it is important to remember this.

It's time to talk about the last parameter — `targetPosition`. This is the position where the `sourceElement` should be in the `targetElement`. The value of this parameter can be a number from zero to the total number of elements in the `targetElement` (inclusive).

Let's say the following elements are in the `targetElement`: `A, B, C`. Thus, for `targetPosition`, you can specify only: `0, 1, 2, 3`. If you specify the maximum position, i.e. `3`, then the `sourceElement` will be inserted at the very end. In all other cases, the `sourceElement` will be in place of the element that currently occupies the specified position. If `targetElement` has no child elements at all, then the maximum position will be `0` and in this case it makes no sense to specify `targetPosition`. This is because the parameter is optional, and its default value is `0`.

I will specify this parameter with the value `1`. You may have some other position.

```JS
new TransferElements(
  {
    sourceElement: document.getElementById('id-1'),
    breakpoints: {
      990: {
        targetElement: document.getElementById('id-2'),
        targetPosition: 1
      }
    }
  }
);
```

<h2 id="parameters">
  <img src="./assets/parameters-section-en.png" alt="Parameters">
</h2>

| Name | Object type | Default | Required | Description |
| -------- | ---------- | ------------ | ---------- | ---------- |
| `sourceElement` | [Element](https://developer.mozilla.org/en-US/docs/Web/API/Element) | | Yes | The element that needs to be transferred. |
| `breakpoints` | [Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object) | | Yes | Breakpoints based on which the `sourceElement` should be transferred. |
| `targetElement` | [Element](https://developer.mozilla.org/en-US/docs/Web/API/Element) | | Yes | The element to which the `sourceElement` should be transferred. |
| `targetPosition` | [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number) | `0` | No | The position where the `sourceElement` should be in the `targetElement`. |

<h2 id="browser-compatibility">
  <img src="./assets/browser-compatibility-section-en.png" alt="Browser compatibility">
</h2>

<div align="center">
  <table>
    <thead>
      <tr>
        <th>Chrome 120</th>
        <th>Edge 120</th>
        <th>Safari 17</th>
        <th>Firefox 121</th>
        <th>Opera 106</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td align="center">✅</td>
        <td align="center">✅</td>
        <td align="center">✅</td>
        <td align="center">✅</td>
        <td align="center">✅</td>
      </tr>
    </tbody>
  </table>
</div>

<h2 id="community">
  <img src="./assets/community-section-en.png" alt="Community">
</h2>

If you have any ideas on how to improve the library or something became unclear at any stage when reading the documentation, do not hesitate and write in the “Issues” section, or by email: sineylodev@gmail.com. I am interested in developing my products, so I will try to answer all questions as quickly as possible. Together we can make the interface development process much more enjoyable ✨
