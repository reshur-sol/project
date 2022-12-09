const ChangeBtn = () => {
  const RandomColor = Math.floor(Math.random() * 16777215).toString(16);
  document.body.style.backgroundColor = "#" + RandomColor;
  color__code.innerHTML = "#" + RandomColor;
};
