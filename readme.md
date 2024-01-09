<h1 align="center">
 🌿 Transfer Elements 🌿
</h1>

![Cover](./assets/cover.png)

<p align="center">
  <strong>The future belongs to those who are preparing for it today. (Malcolm X)</strong>
</p>

<p align="center">
  <a href="./readme-ru.md">Documentation in Russian</a>
</p>

## ![Navigation](./assets/navigation-section-en.png)

- [Installation](#installation)
- [Connection](#connection)
- [Usage](#usage)
- [Parameters](#parameters)
- [Browser compatibility](#browser-compatibility)
- [History of creation](#history-of-creation)

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
import TransferElements from 'https://cdn.jsdelivr.net/npm/transfer-elements@1.0.3/dist/transfer-elements.esm.min.js'
```

### Tag \<script\>

Just like with modules, you can use CDN if you wish.

```HTML
<script src="https://cdn.jsdelivr.net/npm/transfer-elements@1.0.3">
```

The link is shorter than for modules because the file is requested by default `transfer-elements.min.js `. Anyway, you can specify the full link.

```HTML
<script src="https://cdn.jsdelivr.net/npm/transfer-elements@1.0.3/dist/transfer-elements.min.js">
```

### Other

If all of the above options are not suitable for any reason, you can [download the files](https://registry.npmjs.org/transfer-elements/-/transfer-elements-1.0.3.tgz) and connect the library the way you need.

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
| `breakpoint` | [Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object) | | Yes | The breakpoint based on which to transfer the `sourceElement`. |
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

<h2 id="history-of-creation">
  <img src="./assets/history-of-creation-section-en.png" alt="History of creation">
</h2>

I, like many other web developers, started my journey by learning HTML/CSS. Of course, I didn't know the JS programming language, but that didn't stop me from taking on projects of various levels of complexity. I was sure that any problem that arose would be closed by a library that someone had already written a long time ago.

One day I saw a layout in which, on the mobile version of the main page, it was necessary to move a block from one section to another. The first thing that came to my mind was to use absolute positioning, but in this case accessibility will suffer. The second is to duplicate the block, hiding it initially, because it should not be visible on the computer version. The bottom line is that depending on the breakpoint, one block would be shown and the other hidden. The disadvantage of this option is a banal increase in the number of lines of code, as well as, accordingly, the weight of the file.

Both of these options did not suit me and I started looking for a library. But my search was not successful. All those code snippets that I found either didn't work as they should, or weren't completed at all.

Quite a long time has passed since that moment and I decided to return to this problem, since it did not give me peace of mind. Back then, I found out that everything rested on the `change` event of the `MediaQueryList` object.

Let's say we need to perform a transfer on ten breakpoints. If we immediately switch to the last breakpoint, the event will trigger all ten times. With constant switching between breakpoints, the event will be triggered for each breakpoint up to the active one and, in addition, carry out transfers. Therefore, this event is too costly in terms of performance.

Anyway, I managed to solve the problem and ensure that the sequential transfer is performed only once when the page loads. This is achieved through the "Transfer Simulation" technology, which you can read about below. An incredible number of days have been spent thinking about everything, but the result is worth it.
