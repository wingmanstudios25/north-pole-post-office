import Envelope from "@/components/Envelope";
import { register } from "@/lib/order";

// Print-and-cut envelope front, seal and return label (A4).
export function PrintEnvelope({ child }) {
  return (
    <div className="lt-page plain px-sheet">
      <div className="px-title">Cut along the dotted lines</div>
      <div className="px-cut px-env"><Envelope name={child.name} town={child.town} className="addressed" /></div>
      <div className="px-row">
        <div className="px-cut px-seal"><img src="/art/seal.png" alt="" /></div>
        <div className="px-cut px-label"><div className="lt-office">Office of Father Christmas</div><div className="lt-addr">The North Pole · Arctic Circle</div><div className="px-small">If undelivered, return by reindeer</div></div>
        <div className="px-cut px-seal"><img src="/art/stamp.png" alt="" style={{ width: "62%" }} /></div>
      </div>
      <ol className="px-how">
        <li>Print this page on A4 and cut out the four pieces.</li>
        <li>Fold the letter in three and put it in a plain long envelope.</li>
        <li>Glue the large panel to the front, the label to the back, and close the flap with the wax seal.</li>
        <li>Leave it on the doormat, by the fireplace, or under their pillow.</li>
      </ol>
    </div>
  );
}

// Nice List certificate (A4).
export function Certificate({ child, year }) {
  const reg = register(child, year);
  return (
    <div className="lt-page cert">
      <img className="lt-paper" src="/art/paper.jpg" alt="" />
      <div className="cert-frame" />
      <img className="lt-wm" src="/art/snowflake.svg" alt="" />
      <div className="cert-in">
        <img className="lt-crest" src="/art/crest.png" alt="" />
        <div className="lt-office">Office of Father Christmas</div>
        <div className="lt-addr">The North Pole · Arctic Circle</div>
        <img className="lt-rule" src="/art/rule.svg" alt="" />
        <div className="cert-title">The Nice List</div>
        <div className="cert-sub">Certificate of Entry for Christmas {year}</div>
        <p className="cert-p">Be it known to all at the North Pole, and to everyone at home, that</p>
        <div className="cert-name">{child.name}</div>
        <div className="cert-of">of {child.town}</div>
        <p className="cert-p">has been entered in the Nice List Register, Volume {reg.vol}, Folio {reg.folio},<br />having this year {child.achievement},<br />and having been {child.goodAt}.</p>
        <p className="cert-twice">Checked once. Checked twice.</p>
        <div className="cert-sign"><div><div className="lt-sig">Father Christmas</div><div className="cert-cap">Given under my hand at the North Pole</div></div><img className="cert-seal" src="/art/seal.png" alt="" /></div>
      </div>
      <img className="lt-hs" src="/art/handstamp.png" alt="" />
      <div className="lt-foot">By Sleigh · By Starlight · Since Time Out of Mind</div>
    </div>
  );
}
