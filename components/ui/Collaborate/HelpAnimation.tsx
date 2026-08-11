"use client";

export function animateHelpButton(button: HTMLElement) {

  const launchAnimation = () => {

    const target = document.querySelector(".help-icon-button");
    

    if (!target) return;


    const start = button.getBoundingClientRect();
    const end = target.getBoundingClientRect();


    const flying = document.createElement("div");

    flying.className = "flying-help-animation";

    flying.innerHTML = "🤝";


    flying.style.left =
      `${start.left + start.width / 2}px`;

    flying.style.top =
      `${start.top + start.height / 2}px`;


    document.body.appendChild(flying);


    flying.getBoundingClientRect();


    const x =
      end.left + end.width / 2 -
      (start.left + start.width / 2);

    const y =
      end.top + end.height / 2 -
      (start.top + start.height / 2);


    requestAnimationFrame(() => {

      flying.style.transform =
        `translate(${x}px, ${y}px) scale(0.45)`;

      flying.style.opacity = "0.2";

    });


    setTimeout(() => {

      flying.remove();

    }, 700);

  };


  // Esperamos a que React monte HelpButton
  requestAnimationFrame(() => {

    requestAnimationFrame(() => {

      launchAnimation();

    });

  });
}