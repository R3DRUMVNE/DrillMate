const themesList = {
    "default": {
        "primaryColor": "#0060b9",
        "secondaryColor": "#303F9F",
        "button": "#007cc1",
        "stop": "#b42c38",
        "ready": "#009950",
        "shadow": "rgba(0, 0, 0, 0.5)",
        "noShadow": "rgba(0, 0, 0, 0)",
        "primaryText": "#F4F4F4",
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
    },
    "blackAndWhite":{
        "primaryColor": "Gray",
        "secondaryColor": "DarkGray",
        "button": "DimGray",
        "stop": "#b42c38",
        "ready": "#009950",
        "shadow": "rgba(0, 0, 0, 0.5)",
        "noShadow": "rgba(0, 0, 0, 0)",
        "primaryText": "#F4F4F4",
    },
};

export let appTheme = {
    currentTheme: "",

    getColor: function(colorName){
        return themesList[appTheme.currentTheme][colorName];
    },

    change: function(selectedTheme){
    if(selectedTheme === null){
        appTheme.currentTheme = "default";
        selectedTheme = appTheme.currentTheme;
    } else if(selectedTheme === "likeSystem"){
        const isSystemDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        appTheme.currentTheme = isSystemDarkMode ? "dark" : "default";
    }else{
        appTheme.currentTheme = selectedTheme;
    }
    localStorage.setItem('appTheme', selectedTheme);

    const colors = Object.entries(themesList[appTheme.currentTheme]);
    for(let i = 0; i < colors.length; i++){
        document.documentElement.style.setProperty("--" + colors[i][0], colors[i][1]);
    }
},
}