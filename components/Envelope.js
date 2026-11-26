// The stamped, postmarked envelope, addressed by hand.
export default function Envelope({ name, town, className = "" }) {
  return (
    <div className={"envelope " + className}>
      <img className="pm" src="/art/postmark.png" alt="" /><img className="st" src="/art/stamp.png" alt="" />
      <div className={"to name" + (name ? "" : " faint")}>{name || "Their name here"}</div>
      <div className={"to town" + (town ? "" : " faint")}>{town || "their town"}</div>
      <div className="air">By Reindeer Air Mail</div>
    </div>
  );
}
