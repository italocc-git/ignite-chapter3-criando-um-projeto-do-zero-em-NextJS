export const UtterancComments = () => {


  return (
    <section style={{marginBottom: '1rem'}}
    ref={elem => {
      if (!elem) {
        return;
      }
      const scriptElem = document.createElement("script");
      scriptElem.src = "https://utteranc.es/client.js";
      scriptElem.async = true;
      scriptElem.crossOrigin = "anonymous";
      scriptElem.setAttribute("repo", "italocc-git/ignite-chapter3-criando-um-projeto-do-zero-em-NextJS");
      scriptElem.setAttribute("issue-term", "pathname");
      scriptElem.setAttribute("label", "blog-comment");
      scriptElem.setAttribute("theme", "github-light");
      elem.appendChild(scriptElem);
    }}
  />
  )
}
