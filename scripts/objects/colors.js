import {createElement} from "../modules/otherModules.js";

const themesList = {
    "default": {
        "primaryColor": "#4141D1",
        "secondaryColor": "#4A0094",
        "button": "#0077EC",
        "stop": "#b42c38",
        "ready": "#009950",
        "shadow": "rgba(0, 0, 0, 0.5)",
        "noShadow": "rgba(0, 0, 0, 0)",
        "primaryText": "#F4F4F4",
        "excessPump": "#ffae00",
        "greatPump": "#37ff00",
    },
    "dark":{
        "primaryColor": "#373737",
        "secondaryColor": "#111111",
        "button": "#5D5D5D",
        "stop": "#b42c38",
        "ready": "#009950",
        "shadow": "rgba(0, 0, 0, 0.5)",
        "noShadow": "rgba(0, 0, 0, 0)",
        "primaryText": "#F4F4F4",
        "excessPump": "#ffae00",
        "greatPump": "#37ff00",
    },
    "gray":{
        "primaryColor": "#5E6367",
        "secondaryColor": "#323639",
        "button": "#919499",
        "stop": "#b42c38",
        "ready": "#009950",
        "shadow": "rgba(0, 0, 0, 0.5)",
        "noShadow": "rgba(0, 0, 0, 0)",
        "primaryText": "#F4F4F4",
        "excessPump": "#ffae00",
        "greatPump": "#37ff00",
    },
};

export let appTheme = {
    currentTheme: "",
    browserHead: createElement(document.head, "meta", "name=theme-color"),

    getColor: function(colorName){
        return themesList[appTheme.currentTheme][colorName];
    },

    change: function(selectedTheme){
    if(selectedTheme === null){
        appTheme.currentTheme = "default";
        selectedTheme = appTheme.currentTheme;
    } else if(selectedTheme === "likeSystem"){
        appTheme.currentTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? "dark" : "default";
    }else{
        appTheme.currentTheme = selectedTheme;
    }
    localStorage.setItem('appTheme', selectedTheme);

    const colors = Object.entries(themesList[appTheme.currentTheme]);
    for(let i = 0; i < colors.length; i++){
        document.documentElement.style.setProperty("--" + colors[i][0], colors[i][1]);
    }

    this.browserHead.setAttribute("content", this.getColor("primaryColor"));
},
}