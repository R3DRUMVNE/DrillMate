const style = getComputedStyle(document.body);

export const colors = {
    "primaryColor": style.getPropertyValue("--primaryColor"),
    "secondaryColor": style.getPropertyValue("--secondaryColor"),
    "button": style.getPropertyValue("--button"),
    "stop": style.getPropertyValue("--stop"),
    "ready": style.getPropertyValue("--ready"),
    "primaryText": style.getPropertyValue("--primaryText"),
};