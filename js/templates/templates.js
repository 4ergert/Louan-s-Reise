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
					<button type="button" class="dialogActionButton" data-dialog-target="settingsDialog">Einstellungen</button>
					<button type="button" class="dialogActionButton" data-dialog-target="instructionsDialog">Bedienungsanleitung</button>
					<button type="button" class="dialogActionButton" data-dialog-target="impressumDialog">Impressum</button>
					<button type="button" class="dialogActionButton" data-dialog-target="datenschutzDialog">Datenschutz</button>
					<button type="button" class="dialogActionButton" data-dialog-target="creditsDialog">Credits</button>
				</div>
			</div>
		</dialog>
	`;
}

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
					<p>Asset-, Audio- und Font-Lizenzen hier gesammelt auffuehren.</p>
				</div>
				<div class="metaDialogFooter">
					<button type="button" class="dialogSecondaryButton backToMenuButton" data-return-dialog-target="gameMenuDialog" hidden>Zurueck zum Menue</button>
				</div>
			</div>
		</dialog>
	`;
}

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
					<p>Datenschutzhinweise bitte vor der Veroeffentlichung ergaenzen.</p>
					<p>Relevant bei externen Diensten, Fonts, Analytics oder Formularen.</p>
				</div>
				<div class="metaDialogFooter">
					<button type="button" class="dialogSecondaryButton backToMenuButton" data-return-dialog-target="gameMenuDialog" hidden>Zurueck zum Menue</button>
				</div>
			</div>
		</dialog>
	`;
}

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
					<p>Verantwortliche Angaben bitte vor der Veroeffentlichung vervollstaendigen.</p>
					<p>Empfohlen: Name, Anschrift und Kontaktmoeglichkeit.</p>
				</div>
				<div class="metaDialogFooter">
					<button type="button" class="dialogSecondaryButton backToMenuButton" data-return-dialog-target="gameMenuDialog" hidden>Zurueck zum Menue</button>
				</div>
			</div>
		</dialog>
	`;
}

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

export function startScreenControlsTemplate() {
	return `
		<section id="startScreenControls" aria-label="Steuerung">
			<button type="button" id="startScreenMenuButton" class="startScreenActionButton" aria-label="Menue">☰</button>
			<button type="button" id="musicToggleButton" aria-pressed="false" aria-label="Musik stummschalten">♪</button>
			<button type="button" id="startScreenInstructionsButton" data-dialog-target="instructionsDialog">Steuerung</button>
		</section>
	`;
}

export function startScreenTemplate() {
	return `
		<section id="startScreen">
			<p>
				Louan, der Krieger, ist ein mutiger und entschlossener Held. <br>
				Aus einem schrecklichen Alptraum ist er erwacht, in dem seine Geschwister verschwunden sind. <br>
				Er beschließt sich auf die Suche nach ihnen zu machen. <br>
			</p>
		</section>
	`;
}
