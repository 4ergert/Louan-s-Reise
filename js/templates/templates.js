/**
 * Returns the HTML template for the in-game menu dialog.
 *
 * @returns {string}
 */
export function gameMenuDialogTemplate() {
  return `
		<dialog id="gameMenuDialog" class="metaDialog gameMenuDialog" aria-labelledby="gameMenuTitle">
			<div class="metaDialogContent">
				<div class="metaDialogHeader">
					<h2 id="gameMenuTitle">Menue</h2>
					<form method="dialog">
						<button type="submit" class="metaDialogClose" aria-label="Dialog schliessen">X</button>
					</form>
				</div>
				<div class="metaDialogBody gameMenuActions">
        <button type="button" class="dialogActionButton" data-menu-action="restart-game">Neustart</button>
        <button type="button" class="dialogActionButton" data-music-toggle data-music-toggle-label="Sound" aria-pressed="false" aria-label="Musik stummschalten">Sound</button>
					<button type="button" class="dialogActionButton" data-dialog-target="instructionsDialog">Bedienungsanleitung</button>
					<button type="button" class="dialogActionButton" data-dialog-target="impressumDialog">Impressum</button>
					<button type="button" class="dialogActionButton" data-dialog-target="datenschutzDialog">Datenschutz</button>
					<button type="button" class="dialogActionButton" data-dialog-target="creditsDialog">Credits</button>
				</div>
			</div>
		</dialog>
	`;
}

/**
 * Shared story text shown on the start screen and in the about dialog.
 *
 * @returns {string}
 */
function startScreenStoryTemplate() {
  return `
				Louan, der Krieger, ist ein mutiger und entschlossener Held. <br>
				Aus einem schrecklichen Alptraum ist er erwacht, in dem seine Geschwister verschwunden sind. <br>
				Er beschließt sich auf die Suche nach ihnen zu machen. <br>
	`;
}

/**
 * Returns the HTML template for the instructions dialog.
 *
 * @returns {string}
 */
export function instructionsDialogTemplate() {
  return `
		<dialog id="instructionsDialog" class="metaDialog" aria-labelledby="instructionsTitle">
			<div class="metaDialogContent">
				<div class="metaDialogHeader">
					<h2 id="instructionsTitle">Steuerung</h2>
					<form method="dialog">
						<button type="submit" class="metaDialogClose" aria-label="Dialog schliessen">X</button>
					</form>
				</div>
				<div class="metaDialogBody">
					<p>Pfeiltaste links = laufen links</p>
					<p>Pfeiltaste rechts = laufen rechts</p>
					<p>Pfeiltaste oben = springen</p>
					<p>A + Pfeiltaste = rennen</p>
					<p>F = schmeißen</p>
					<p>F11 = Vollbildmodus</p>
				</div>
				<div class="metaDialogFooter">
					<button type="button" class="dialogSecondaryButton backToMenuButton" data-return-dialog-target="gameMenuDialog" hidden>Zurueck zum Menue</button>
				</div>
			</div>
		</dialog>
	`;
}

/**
 * Returns the about dialog used on compact start screens.
 *
 * @returns {string}
 */
export function aboutDialogTemplate() {
  return `
		<dialog id="aboutDialog" class="metaDialog" aria-labelledby="aboutTitle">
			<div class="metaDialogContent">
				<div class="metaDialogHeader">
					<h2 id="aboutTitle">Ueber</h2>
					<form method="dialog">
						<button type="submit" class="metaDialogClose" aria-label="Dialog schliessen">X</button>
					</form>
				</div>
				<div class="metaDialogBody">
					<p>
						${startScreenStoryTemplate()}
					</p>
				</div>
			</div>
		</dialog>
	`;
}

/**
 * Returns the HTML template for the settings dialog.
 *
 * @returns {string}
 */
export function settingsDialogTemplate() {
  return `
		<dialog id="settingsDialog" class="metaDialog" aria-labelledby="settingsTitle">
			<div class="metaDialogContent">
				<div class="metaDialogHeader">
					<h2 id="settingsTitle">Einstellungen</h2>
					<form method="dialog">
						<button type="submit" class="metaDialogClose" aria-label="Dialog schliessen">X</button>
					</form>
				</div>
				<div class="metaDialogBody">
					<p>Weitere Einstellungen koennen hier spaeter ergaenzt werden.</p>
					<p>Die Musik kannst du bereits ueber das Notensymbol ein- und ausschalten.</p>
				</div>
				<div class="metaDialogFooter">
					<button type="button" class="dialogSecondaryButton backToMenuButton" data-return-dialog-target="gameMenuDialog" hidden>Zurueck zum Menue</button>
				</div>
			</div>
		</dialog>
	`;
}

/**
 * Returns the HTML template for the credits dialog.
 *
 * @returns {string}
 */
export function creditsDialogTemplate() {
  return `
		<dialog id="creditsDialog" class="metaDialog" aria-labelledby="creditsTitle">
			<div class="metaDialogContent">
				<div class="metaDialogHeader">
					<h2 id="creditsTitle">Credits</h2>
					<form method="dialog">
						<button type="submit" class="metaDialogClose" aria-label="Dialog schliessen">X</button>
					</form>
				</div>
				<div class="metaDialogBody">
					<p>Spielkonzept und Umsetzung: Julian</p>
					<p>Bild-Assets: Craftpix</p>
					<p>Soundeffekte und Musik: Pixabay</p>
					<p>Schriften: Google Fonts</p>
				</div>
				<div class="metaDialogFooter">
					<button type="button" class="dialogSecondaryButton backToMenuButton" data-return-dialog-target="gameMenuDialog" hidden>Zurueck zum Menue</button>
				</div>
			</div>
		</dialog>
	`;
}

/**
 * Returns the HTML template for the privacy-policy dialog.
 *
 * @returns {string}
 */
export function datenschutzDialogTemplate() {
  return `
		<dialog id="datenschutzDialog" class="metaDialog" aria-labelledby="datenschutzTitle">
			<div class="metaDialogContent">
				<div class="metaDialogHeader">
					<h2 id="datenschutzTitle">Datenschutz</h2>
					<form method="dialog">
						<button type="submit" class="metaDialogClose" aria-label="Dialog schliessen">X</button>
					</form>
				</div>
				<div class="metaDialogBody">
					<p>Dieses Spiel verarbeitet innerhalb der Anwendung keine personenbezogenen Daten wie Namen, E-Mail-Adressen oder Formulareingaben.</p>
					<p>Es werden keine Tracking-, Analyse- oder Werbedienste eingebunden.</p>
					<p>Bilder, Sounds und Schriften werden lokal aus dem Projekt geladen. Es werden dafuer keine externen Server von Craftpix, Pixabay oder Google Fonts direkt aus der Anwendung heraus kontaktiert.</p>
					<p>Je nach Hosting koennen durch den Webserver technisch notwendige Verbindungsdaten wie IP-Adresse, Datum, Uhrzeit und aufgerufene Datei in Server-Logs verarbeitet werden. Darauf hat die Anwendung selbst keinen direkten Einfluss.</p>
				</div>
				<div class="metaDialogFooter">
					<button type="button" class="dialogSecondaryButton backToMenuButton" data-return-dialog-target="gameMenuDialog" hidden>Zurueck zum Menue</button>
				</div>
			</div>
		</dialog>
	`;
}

/**
 * Returns the HTML template for the imprint dialog.
 *
 * @returns {string}
 */
export function impressumDialogTemplate() {
  return `
		<dialog id="impressumDialog" class="metaDialog" aria-labelledby="impressumTitle">
			<div class="metaDialogContent">
				<div class="metaDialogHeader">
					<h2 id="impressumTitle">Impressum</h2>
					<form method="dialog">
						<button type="submit" class="metaDialogClose" aria-label="Dialog schliessen">X</button>
					</form>
				</div>
				<div class="metaDialogBody">
					<p><strong>Angaben gemaess Paragraf 5 TMG</strong></p>
					<p>Julian Aergert<br>Sandstrasse 32<br>48429 Rhein</p>
					<p><strong>Kontakt</strong><br>E-Mail: julian.aergert@gmx.net</p>
					<p><strong>Verantwortlich fuer den Inhalt nach Paragraf 18 Abs. 2 MStV</strong><br>Julian Aergert<br>Sandstrasse 32<br>48429 Rhein</p>
				</div>
				<div class="metaDialogFooter">
					<button type="button" class="dialogSecondaryButton backToMenuButton" data-return-dialog-target="gameMenuDialog" hidden>Zurueck zum Menue</button>
				</div>
			</div>
		</dialog>
	`;
}

/**
 * Returns the legal-links section shown on the start screen.
 *
 * @returns {string}
 */
export function startScreenMetaTemplate() {
  return `
		<section id="startScreenMeta" aria-label="Rechtliche Hinweise und Credits">
			<div id="startScreenActions">
				<button type="button" class="startScreenActionButton" data-dialog-target="impressumDialog">Impressum</button>
				<button type="button" class="startScreenActionButton" data-dialog-target="datenschutzDialog">Datenschutz</button>
				<button type="button" class="startScreenActionButton" data-dialog-target="creditsDialog">Credits</button>
			</div>
			<p id="startScreenCopyright">&copy; 2026 Julian Aergert</p>
      </section>
	`;
}

/**
 * Returns the control-button section shown on the start screen.
 *
 * @returns {string}
 */
export function startScreenControlsTemplate() {
  return `
		<section id="startScreenControls" aria-label="Steuerung">
			<button type="button" id="startScreenAboutButton" class="startScreenActionButton" data-dialog-target="aboutDialog">Ueber</button>
			<button type="button" id="startScreenMenuButton" class="startScreenActionButton" aria-label="Menue">MENU</button>
			<button type="button" id="musicToggleButton" aria-pressed="false" aria-label="Musik stummschalten">♪</button>
			<button type="button" id="startScreenInstructionsButton" data-dialog-target="instructionsDialog">Steuerung</button>
		</section>
	`;
}

/**
 * Returns the intro text section for the start screen.
 *
 * @returns {string}
 */
export function startScreenTemplate() {
  return `
		<section id="startScreen">
			<p>
				${startScreenStoryTemplate()}
			</p>
		</section>
	`;
}
