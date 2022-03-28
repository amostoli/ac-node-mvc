//Tuodaan toiminnot oikeista osotteista???

import Paste from "../models/paste.js";
import hljs from 'highlight.js'
import { escape } from "html-escaper";
// Haetaan kaikki pastet toiminnon luominen
const getAllPastes = async(req, res, next) => {
    try {
        // Haetaan pastet???
        const pasteItems = await Paste.find({});
        //Jos haku epäonnistuu niin annetaan error status 404
        if (!pasteItems) return res.status(404).send();

        //Toiminto onnistunut, luodaan uusi sivu missä näkyy kaikki pastet???
        res.render('paste/pasteViewAll', { pasteItems })
    } catch (e) {
        // Jos ohjelma kaatuu niin lähetetään error middlewaren käsiteltäväksi
        next(e);
    }
}

// Luodaan uusi pasten haku id:n perusteella toiminto???
const getPaste = async(req, res, next) => {
    //Jos toiminto epäonnistuu annetaan error status 404???
    if (!req.params.id) {
        res.status(400).send();
        return
    }

    try {

        //Haetaan paste id:n perusteella???
        const paste = await Paste.findById(req.params.id);
        // Jos haku epäonnistuu annetaan error status 404???
        if (!paste) return res.status(404).send();

        //Toimnto onnistuu, näytetään haettu paste
        res.render('paste/pasteViewSingle', paste)
    } catch (e) {
        // Jos ohjelma kaatuu niin lähetetään error middlewaren käsiteltäväksi
        next(e);
    }
}

// Uuden pasten luominen
const getCreateNewPaste = (req, res, next) => {
    res.render('paste/pasteViewCreate')
}

// Uuden pasten luominen, ottaa vastaan POST requestin
const postCreateNewPaste = async(req, res, next) => {

    try {
        // Ottaa vastaan POST requestin bodyssä seuraavat tiedot:
        // title, description, body
        const { title, description, body } = req.body

        // Tarkistetaan ettei mikään vaadituista tiedoista ole tyhjä,
        // jos on niin lähetetään error viesti middlewaren käsiteltäväksi
        if (!title || !description || !body) return next('Kaikki kentät tulee täyttää')

        // Luodaan uusi Paste instanssi Paste modelin perusteella
        const paste = new Paste({
            // Poistetaan XSS haavoittuvuus
            title: escape(title),
            description: escape(description),
            // Lisätään highlight.js:n muutokset body datalle eli koodipastelle.
            // highlightAuto metodi yrittää tunnistaa koodin ja laittaa värit sen perusteella.
            // Käsittely hoitaa samalla string escapen body -datalle, mites muut datat?
            body: hljs.highlightAuto(body).value
        });

        // Tallennetaan Paste instanssin data tietokantaan
        const data = await paste.save();

        // Jos tietokanta ei anna vastausta niin toiminto on epäonnistunut
        // ja lähetetään error status 500 - internal server error
        if (!data) {
            return res.status(500).send()
        }


        // Uusi data luotu onnistuneesti
        // Luodaan pasteViewSingle html sivu ja palautetaan se selaimelle luodun paste datan kanssa
        res.render('paste/pasteViewSingle', data)

    } catch (e) {
        // Jos ohjelma kaatuu niin lähetetään error middlewaren käsiteltäväksi
        next(e)
    }
}
// Luodaan uusi Pasten poistotoiminto
const deletePaste = async(req, res, next) => {

        // Jos tietokanta ei anna vastausta niin toiminto on epäonnistunut
        // ja lähetetään error status 400
    if (!req.params.id) return res.status(400).send();
    try {

        //HUOM!! Kysymysmerkit perässä koska en ole varma mitä nämä tarkalleen tarkoittaa
        //Haetaan poistettava paste id:n perusteella???
        const paste = await Paste.findById(req.params.id);
        //Jos haku ei onnistu lähetetään error status 404???
        if (!paste) return res.status(404).send();
        // Jos haku onnistuu niin poistetaan paste???
        await paste.delete();
        // Onnistuneen poistotoiminnon jälkeen annetaan palaute
        next("Poisto onnistui")

    } catch (e) {
        // Jos ohjelma kaatuu niin lähetetään error middlewaren käsiteltäväksi
        next(e);
    }
}


//toimintojen oletusarvot???
export default {
    getPaste,
    getAllPastes,
    getCreateNewPaste,
    postCreateNewPaste,
    deletePaste
}