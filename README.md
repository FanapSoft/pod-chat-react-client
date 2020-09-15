# Podchatweb
> Podchatweb is a web app built by react for handling POD chating use cases

[![Preview of Podchat web][preview_image]][preview_image_url]

## Development

```bash
npm run start
```

## Installation

```
npm install podchatweb --save
```

## Usage

React component:

```jsx
import {PodchatReact} from "podchatweb"

class MyApp extends Component {
    render() {
        const {token} = this.props;
        return 
        <div>
            <PodchatReact token={token} onTokenExpire={callBack => {callBack(token)}}/>
        </div>
    }
}
```

### Programmatic calling:
#### Module loader:
```jsx
import {Podchat} from "podchatweb"

class MyApp extends Component {

    componentDidMount() {
        const {token} = this.props;
        Podchat({token}, "myChat")
    }
    
    render() {
        return <div id="myChat"/>
    }
}
```

#### Old school:
```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <script src="dist/index.js"/>
</head>

<body>
<div id="app"></div>
<script>
var podchat = Podchat({token: "YOUR_TOKEN"}, "app");
//GOT NEW TOKEN
podchat.setToken("YOUR_NEW_TOKEN");
</script>
</body>
</html>
```

## License

This project is open-sourced software licensed under the [MIT license](http://opensource.org/licenses/MIT).


[//]: # (LINKS)
[preview_image]: https://raw.githubusercontent.com/FanapSoft/pod-chat-react-client/master/docs/preview.png "Preview of podchat web"
[preview_image_url]: https://raw.githubusercontent.com/FanapSoft/pod-chat-react-client/master/docs/preview.png