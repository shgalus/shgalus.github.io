/*jslint browser : true, devel : true, for : true, maxlen : 70,
  multivar : true, single : true, this : true, white : true */

/*
 * Example game with empty field 1:
 * 1.3-1 2.12-2 3.4-6 4.18-5 5.9-11 6.26-12 7.12-10 8.23-9 9.9-11
 * 10.21-19 11.34-21 12.24-26 13.26-28 14.35-25 15.37-27 16.22-20
 * 17.20-33 18.33-31 19.8-21 20.30-32 21.2-12 22.12-14 23.15-13
 * 24.29-27 25.36-26 26.26-24 27.24-10 28.10-12 29.12-14 30.14-28
 * 31.28-26 32.26-12 33.1-11 34.11-13 35.13-3
 *
 * Source: http://recmath.org/pegsolitaire/index.html,
 * http://recmath.org/pegsolitaire/Catalogs/French37/index.htm,
 * http://recmath.org/pegsolitaire/Catalogs/French37/
 * c1toe1in20Sweep8.gif, May 2017.
 */

var Solitaire = function() {
    "use strict";
    this.fld_prefix = "idboardfld";
    this.fld_prefix_length = this.fld_prefix.length;
    this.clicked = 0;
    this.sound = false;
    this.lang0 = this.languages.en;
};

Solitaire.prototype.languages = {
    en: 0,
    pl: 1
};

Solitaire.prototype.instren =
    "The objective of the game is to leave exactly "
    + "one piece on the board. A move is made by jumping "
    + "a pawn over an adjacent pawn horizontally or "
    + "vertically to an empty field.";

Solitaire.prototype.instrpl =
    "Celem gry jest pozostawienie na planszy dokładnie "
    + "jednego pionka. Ruch wykonuje się przeskakując "
    + "pionkiem przez sąsiedniego pionka poziomo lub "
    + "pionowo na wolne pole.";

Solitaire.prototype.els = {
    pagetitle:   document.getElementById("idpagetitle"),
    h1:          document.getElementById("idh1"),
    ctrlpanel:   document.getElementById("idctrlpanel"),
    instr:       document.getElementById("idinstr"),
    newgame:     document.getElementById("idnewgame"),
    first:       document.getElementById("idfirst"),
    previous:    document.getElementById("idprevious"),
    next:        document.getElementById("idnext"),
    last:        document.getElementById("idlast"),
    lang:        document.getElementById("idlang"),
    sound:       document.getElementById("idsound"),
    movepanel:   document.getElementById("idmovepanel"),
    moves:       document.getElementById("idmoves"),
    instruction: document.getElementById("idinstruction"),
    audioerror:  document.getElementById("idaudioerror")
    // result is here added in finish_game
};

Solitaire.prototype.images = {
    /* Only dynamic images go here. */
    pegn:     "unhighlited.png",
    pegh:     "highlited.png",
    pege:     "empty.png",
    english:  "english.png",
    polish:   "polish.png",
    instron:  "instron.png",
    instroff: "instroff.png",
    soundon:  "soundon.png",
    soundoff: "soundoff.png"
};

Solitaire.prototype.dict = {
    /* Only strings used more than once are listed here. Strings used
       once are in set_language(). */
    hide_instructions_en: "Hide instructions",
    hide_instructions_pl: "Ukryj instrukcje",
    show_instructions_en: "Show instructions",
    show_instructions_pl: "Pokaż instrukcje",
    turn_sound_off_en:    "Turn sound off",
    turn_sound_off_pl:    "Wyłącz dźwięk",
    turn_sound_on_en:     "Turn sound on",
    turn_sound_on_pl:     "Włącz dźwięk",
    no_more_moves_en:     " No more moves!",
    no_more_moves_pl:     " Nie ma więcej ruchów!",
    win_en:               " Win!",
    win_pl:               " Wygrana!"
};

Solitaire.prototype.set_initial_language = function() {
    "use strict";
    var userLang = navigator.language || navigator.userLanguage;
    this.lang0 = /pl/i.test(userLang)
        ? this.languages.pl
        : this.languages.en;
    this.set_language();
};

Solitaire.prototype.switch_sound = function() {
    "use strict";
    if (this.sound) {
        this.els.sound.src = this.images.soundon;
        this.els.sound.title = this.lang0 === this.languages.en
            ? this.dict.turn_sound_on_en
            : this.dict.turn_sound_on_pl;
        this.sound = false;
    } else {
        this.els.sound.src = this.images.soundoff;
        this.els.sound.title = this.lang0 === this.languages.en
            ? this.dict.turn_sound_off_en
            : this.dict.turn_sound_off_pl;
        this.sound = true;
    }
};

Solitaire.prototype.play_error = function() {
    "use strict";
    if (this.sound) {
        this.els.audioerror.volume = 0.25;
        this.els.audioerror.play();
    }
};

Solitaire.prototype.switch_instructions = function() {
    "use strict";
    var e = this.els.instruction;
    var f = this.els.instr;
    if (e.style.display === "none") {
        e.style.display = "";
        f.src = this.images.instroff;
        f.title = this.lang0 === this.languages.en
            ? this.dict.hide_instructions_en
            : this.dict.hide_instructions_pl;
    } else {
        e.style.display = "none";
        f.src = this.images.instron;
        f.title = this.lang0 === this.languages.en
            ? this.dict.show_instructions_en
            : this.dict.show_instructions_pl;
    }
};

Solitaire.prototype.put_pawns = function(b) {
    "use strict";
    var i;
    for (i = 1; i < b.length; i += 1) {
        document.getElementById(this.fld_prefix + i)
            .childNodes[0].src = b[i] ?
            this.images.pegn : this.images.pege;
    }
};

Solitaire.prototype.gamehist = function() {
    "use strict";
    var n = this.cgame.moves.length, n1;
    var s = '<span class="bold"> ' + n
        + '. </span><a class="tomc" id="idmove' + n
        + '" href="javascript:this.play_move(' + n + ')">';
    if (n === 0) {
        s += "Start</a>";
    } else {
        n1 = n - 1;
        s += this.cgame.moves[n1][0]
            + "-"
            + this.cgame.moves[n1][1]
            + "</a>";
        document.getElementById("idmove" + n1).className = "tomo";
    }
    this.els.moves.innerHTML += s;
};

Solitaire.prototype.set_language = function() {
    "use strict";
    if (this.lang0 === this.languages.en) {
        this.els.instruction.innerHTML = this.instren;
        this.els.pagetitle.innerHTML = "Solitaire";
        this.els.h1.innerHTML = "Solitaire";
        this.els.ctrlpanel.title = "Control panel";
        this.els.newgame.title = "Start new game";
        this.els.first.title = "Initial board";
        this.els.previous.title = "Previous move";
        this.els.next.title = "Next move";
        this.els.last.title = "Last move";
        if (this.els.instruction.style.display === "none") {
            this.els.instr.title = this.dict.show_instructions_en;
        }
        else {
            this.els.instr.title = this.dict.hide_instructions_en;
        }
        this.els.lang.title = "Set Polish";
        this.els.sound.title = this.sound
            ? this.dict.turn_sound_off_en
            : this.dict.turn_sound_on_en;
        this.els.movepanel.title = "Game history";
        this.els.lang.src = this.images.polish;
        if (this.cgame && this.cgame.finished) {
            this.els.result.innerHTML = this.cgame.win
                ? this.dict.win_en
                : this.dict.no_more_moves_en;
        }
    } else if (this.lang0 === this.languages.pl) {
        this.els.instruction.innerHTML = this.instrpl;
        this.els.pagetitle.innerHTML = "Samotnik";
        this.els.h1.innerHTML = "Samotnik";
        this.els.ctrlpanel.title = "Panel sterowania";
        this.els.newgame.title = "Nowa gra";
        this.els.first.title = "Początek gry";
        this.els.previous.title = "Poprzedni ruch";
        this.els.next.title = "Następny ruch";
        this.els.last.title = "Ostatni ruch";
        if (this.els.instruction.style.display === "none") {
            this.els.instr.title = this.dict.show_instructions_pl;
        }
        else {
            this.els.instr.title = this.dict.hide_instructions_pl;
        }
        this.els.lang.title = "Ustaw angielski";
        this.els.sound.title = this.sound
            ? this.dict.turn_sound_off_pl
            : this.dict.turn_sound_on_pl;
        this.els.movepanel.title = "Zapis gry";
        this.els.lang.src = this.images.english;
        if (this.cgame && this.cgame.finished) {
            this.els.result.innerHTML = this.cgame.win
                ? this.dict.win_pl
                : this.dict.no_more_moves_pl;
        }
    }
};

Solitaire.prototype.switch_language = function() {
    "use strict";
    if (this.lang0 === this.languages.en) {
        this.lang0 = this.languages.pl;
        this.els.lang.src = this.images.english;
    } else {
        this.lang0 = this.languages.en;
        this.els.lang.src = this.images.polish;
    }
    this.set_language();
};

Solitaire.prototype.New_game = function() {
    "use strict";
    var nfields = 37;

    /*
     * Board used in table_of_legal_moves1().
     *
     *    j = |    0    1    2    3    4    5    6    7    8    9   10
     * -------+-------------------------------------------------------
     * i =  0 |    0    0    0    0    0    0    0    0    0    0    0
     *        |
     *        |
     *        |
     * i =  1 |    0    0    0    0    0    0    0    0    0    0    0
     *        |
     *        |                     ----------------
     *        |                     |    |    |    |
     * i =  2 |    0    0    0    0 |  1 |  2 |  3 |  0    0    0    0
     *        |                     |    |    |    |
     *        |                --------------------------
     *        |                |    |    |    |    |    |
     * i =  3 |    0    0    0 |  4 |  5 |  6 |  7 |  8 |  0    0    0
     *        |                |    |    |    |    |    |
     *        |           -----+----+----+----+----+----+-----
     *        |           |    |    |    |    |    |    |    |
     * i =  4 |    0    0 |  9 | 10 | 11 | 12 | 13 | 14 | 15 |  0    0
     *        |           |    |    |    |    |    |    |    |
     *        |           -----+----+----+----+----+----+-----
     *        |           |    |    |    |    |    |    |    |
     * i =  5 |    0    0 | 16 | 17 | 18 | 19 | 20 | 21 | 22 |  0    0
     *        |           |    |    |    |    |    |    |    |
     *        |           -----+----+----+----+----+----+-----
     *        |           |    |    |    |    |    |    |    |
     * i =  6 |    0    0 | 23 | 24 | 25 | 26 | 27 | 28 | 29 |  0    0
     *        |           |    |    |    |    |    |    |    |
     *        |           -----+----+----+----+----+----+-----
     *        |                |    |    |    |    |    |
     * i =  7 |    0    0    0 | 30 | 31 | 32 | 33 | 34 |  0    0    0
     *        |                |    |    |    |    |    |
     *        |                --------------------------
     *        |                     |    |    |    |
     * i =  8 |    0    0    0    0 | 35 | 36 | 37 |  0    0    0    0
     *        |                     |    |    |    |
     *        |                     ----------------
     *        |
     * i =  9 |    0    0    0    0    0    0    0    0    0    0    0
     *        |
     *        |
     *        |
     * i = 10 |    0    0    0    0    0    0    0    0    0    0    0
     */
    function table_of_legal_moves1() {
        var i, j, t,
            n = 11,
            b = [],
            m = [];
        for (i = 0; i < n; i += 1) {
            b[i] = [];
            for (j = 0; j < n; j += 1) {
                b[i][j] = 0;
            }
        }
        for (j = 4; j < 7; j += 1) {
            b[2][j] = j - 3;
        }
        for (j = 3; j < 8; j += 1) {
            b[3][j] = j + 1;
        }
        for (j = 2; j < 9; j += 1) {
            b[4][j] = j + 7;
        }
        for (j = 2; j < 9; j += 1) {
            b[5][j] = j + 14;
        }
        for (j = 2; j < 9; j += 1) {
            b[6][j] = j + 21;
        }
        for (j = 3; j < 8; j += 1) {
            b[7][j] = j + 27;
        }
        for (j = 4; j < 7; j += 1) {
            b[8][j] = j + 31;
        }
        for (i = 0; i <= nfields; i += 1) {
            m[i] = [];
        }
        for (i = 0; i < n; i += 1) {
            for (j = 0; j < n; j += 1) {
                if (b[i][j]) {
                    t = [];
                    if (b[i - 2][j] !== 0) {
                        t.push([b[i - 1][j], b[i - 2][j]]);
                    }
                    if (b[i + 2][j] !== 0) {
                        t.push([b[i + 1][j], b[i + 2][j]]);
                    }
                    if (b[i][j - 2] !== 0) {
                        t.push([b[i][j - 1], b[i][j - 2]]);
                    }
                    if (b[i][j + 2] !== 0) {
                        t.push([b[i][j + 1], b[i][j + 2]]);
                    }
                    m[b[i][j]] = t;
                }
            }
        }
        return m;
    }
    function random_board() {
        var i,
            b = [],
            /*
             * The only candidates for empty field. See
             * https://en.wikipedia.org/wiki/Peg_solitaire
             * #Solutions_to_the_European_game,
             * http://recmath.org/pegsolitaire/Catalogs/French37/
             * index.htm, May 2017.
             */
            r = [1, 3, 6, 9, 12, 15, 17, 18, 20, 21, 23,
                 26, 29, 32, 35, 37];
        for (i = 0; i <= nfields; i += 1) {
            b.push(1);
        }
        b[r[Math.floor(Math.random() * r.length)]] = 0;
        return b;
    }
    var tlm = table_of_legal_moves1();
    this.finished = false;
    this.win = false;
    this.tbboards = [random_board()];
    this.moves = [];
    /*
     * Number of displayed position. It takes on values 0 <= nodp <=
     * this.moves.length.
     * nodp = 0 - initial position
     * nodp = 1 - position after move 0
     * nodp = 2 - position after move 1
     * ................................
     * nodp = this.moves.length - position after move
     *        game.moves.length - 1
     */
    this.nodp = 0;
    this.left = nfields - 1;
    this.check_moves_from = function(f0) {
        var i, b = this.tbboards[this.tbboards.length - 1];
        if (b[f0] === 0) {
            return false;
        }
        for (i = 0; i < tlm[f0].length; i += 1) {
            if (b[tlm[f0][i][0]] !== 0 && b[tlm[f0][i][1]] === 0) {
                return true;
            }
        }
        return false;
    };
    this.check_move = function(f0, f1) {
        var i, b = this.tbboards[this.tbboards.length - 1];
        if (b[f0] === 0) {
            return false;
        }
        if (b[f1] !== 0) {
            return false;
        }
        for (i = 0; i < tlm[f0].length; i += 1) {
            if (tlm[f0][i][1] === f1 && b[tlm[f0][i][0]] !== 0) {
                return true;
            }
        }
        return false;
    };
    this.make_move = function(f0, f1) {
        var i, b;
        for (i = 0; i < tlm[f0].length; i += 1) {
            if (tlm[f0][i][1] === f1) {
                this.moves.push([f0, f1]);
                b = this.tbboards[this.tbboards.length - 1].slice();
                b[f0] = 0;
                b[tlm[f0][i][0]] = 0;
                b[f1] = 1;
                this.tbboards.push(b);
                this.nodp += 1;
                break;
            }
        }
        this.left -= 1;
        if (this.left === 1) {
            this.win = true;
            this.finished = true;
        } else if (!this.move_exists()) {
            this.finished = true;
        }
    };
    this.move_exists = function() {
        var i, j, b = this.tbboards[this.tbboards.length - 1];
        for (i = 1; i <= nfields; i += 1) {
            if (b[i]) {
                for (j = 0; j < tlm[i].length; j += 1) {
                    if (b[tlm[i][j][0]] && !b[tlm[i][j][1]]) {
                        return true;
                    }
                }
            }
        }
        return false;
    };
};

Solitaire.prototype.start_new_game = function() {
    "use strict";
    this.els.moves.innerHTML = "";
    this.cgame = new this.New_game();
    this.put_pawns(
        this.cgame.tbboards[this.cgame.tbboards.length - 1]);
    this.gamehist();
};

Solitaire.prototype.finish_game = function(n) {
    "use strict";
    var s = '<span id="idresult" class="bold">';
    if (n === 1) {
        s += this.lang0 === this.languages.en
            ? this.dict.win_en
            : this.dict.win_pl;
    } else {
        s += this.lang0 === this.languages.en
            ? this.dict.no_more_moves_en
            : this.dict.no_more_moves_pl;
    }
    s += "</span>";
    this.els.moves.innerHTML += s;
    this.els.result = document.getElementById("idresult");
};

Solitaire.prototype.play_move = function(n) {
    "use strict";
    if (n > this.cgame.moves.length) {
        return;
    }
    document.getElementById(
        "idmove" + this.cgame.nodp).className = "tomo";
    this.cgame.nodp = n;
    this.put_pawns(
        this.cgame.tbboards[this.cgame.nodp]);
    document.getElementById(
        "idmove" + this.cgame.nodp).className = "tomc";
};

Solitaire.prototype.display_first_board = function() {
    "use strict";
    this.play_move(0);
};

Solitaire.prototype.display_previous_board = function() {
    "use strict";
    if (this.cgame.nodp === 0) {
        return;
    }
    this.play_move(this.cgame.nodp - 1);
};

Solitaire.prototype.display_next_board = function() {
    "use strict";
    if (this.cgame.nodp === this.cgame.moves.length) {
        return;
    }
    this.play_move(this.cgame.nodp + 1);
};

Solitaire.prototype.display_last_board = function() {
    "use strict";
    this.play_move(this.cgame.moves.length);
};

var solitaire = new Solitaire();

solitaire.set_initial_language();
solitaire.start_new_game();

document.addEventListener("click", function(e) {
    "use strict";
    var el, elid, f, g;
    el = e.target;
    elid = el.id;
    if (elid === "") {
        el = el.parentNode;
        elid = el.id;
    }
    if (elid.search(solitaire.fld_prefix) !== 0) {
        return;
    }
    if (solitaire.cgame.nodp < solitaire.cgame.moves.length) {
        return;
    }
    f = parseInt(elid.slice(solitaire.fld_prefix_length));
    if (solitaire.clicked) {
        if (f === solitaire.clicked) {
            el.childNodes[0].src = solitaire.images.pegn;
            solitaire.clicked = 0;
        } else {
            g = document.getElementById(
                solitaire.fld_prefix + solitaire.clicked);
            if (solitaire.cgame.check_move(solitaire.clicked, f)) {
                solitaire.cgame.make_move(solitaire.clicked, f);
                solitaire.put_pawns(
                    solitaire.cgame.tbboards
                    [solitaire.cgame.tbboards.length - 1]);
                solitaire.clicked = 0;
                solitaire.gamehist();
                if (solitaire.cgame.finished) {
                    if (solitaire.cgame.win) {
                        solitaire.finish_game(1);
                    } else {
                        solitaire.finish_game(0);
                    }
                }
            } else {
                if (solitaire.cgame.check_moves_from(f)) {
                    g.childNodes[0].src = solitaire.images.pegn;
                    el.childNodes[0].src = solitaire.images.pegh;
                    solitaire.clicked = f;
                } else {
                    solitaire.play_error();
                }
            }
        }
    } else {
        if (solitaire.cgame.check_moves_from(f)) {
            el.childNodes[0].src = solitaire.images.pegh;
            solitaire.clicked = f;
        } else {
            solitaire.play_error();
        }
    }
});
