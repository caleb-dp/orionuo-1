namespace Scripts {

    /**
     * Obsahuje zakladni scripty
     */
    export class Common {

        /**
         * Scripts.Common.svetlo
         * stability released
         *
         * Pouzije svetlo z kade na sebe
         * Pokud nenajde kad, tak zakouzli svetlo.
         * Kouzleni lze zakazat pomoci parametru Scripts.Common.svetlo(false)
         */
        static svetlo(shouldCast = true) {
            const ns = <IPotion>gameObject.potions.ns;
            const kad = Orion.FindType(ns.kad.graphic, ns.kad.color);
            if (kad.length) {
                Orion.WaitTargetObject('self');
                Orion.UseObject(kad[0]);
            }
            else if (shouldCast) {
                Scripts.Spells.cast('Night Sight',TargetEnum.self);
            }
        }

        /**
         * Scripts.Common.shrinkKad
         * stability beta
         *
         * Pouzije shrink kad
         */
        static shrinkKad() {
            const shrink = <IPotion>gameObject.potions.ns;
            const kad = Orion.FindType(shrink.kad.graphic, shrink.kad.color);
            if (kad.length) {
                Orion.UseObject(kad[0]);
            }
            else {
                Scripts.Utils.log('NEMAS SHRINK KAD', ColorEnum.red);
            }
        }

        /**
         * Scripts.Common.hiding
         * stability beta
         *
         * hidne, pripadne prepne war a hidne
         */
        static hiding() {
            Orion.ClearJournal();
            Orion.Print(ColorEnum.none, 'Start Hiding');
            Orion.UseSkill('Hiding');
            Orion.Wait(100);

            while(Orion.InJournal('preoccupied')) {
                Orion.ClearJournal();
                Orion.WarMode(true);
                Orion.Wait(100);
                Orion.Print(ColorEnum.none, 'preoccupied - trying to hide again');
                Orion.UseSkill('Hiding');
            }

            const timeToHide = 2000;
            Orion.AddDisplayTimer('hiding', 2000, 'AboveChar', 'bar', "Hiding", 0, 100, '0x100', 0, 'red');
            Orion.Wait(timeToHide);

            if (Orion.InJournal('You have hidden yourself well')) {
                Orion.CharPrint(Player.Serial(), ColorEnum.green, '[ Hidden ]');
            }
            if (Orion.InJournal('t seem to hide here')) {
                Orion.CharPrint(Player.Serial(), ColorEnum.red, '[ FAILED ]');
            }
        }

        /**
         * Scripts.Common.bandageSelf
         * stability beta
         *
         * hodi si bandu, pripadne vypise ze nema a prehraje wav soubor
         */
        static bandageSelf(minimalCountToWarn = 10, pathToNoBandagesWavFile = 'C:/critical.wav') {
            let bandagesSerials = Orion.FindType(gameObject.uncategorized.bandy.graphic, gameObject.uncategorized.bandy.color);
            let count = Scripts.Utils.countItemsBySerials(bandagesSerials);
            if (!count) {
                Orion.PlayWav(pathToNoBandagesWavFile);
                Scripts.Utils.playerPrint('!! NEMAS BANDY !!', ColorEnum.red);
                return;
            }

            Orion.ClearJournal();
            Orion.BandageSelf();
            while (!Orion.InJournal('You put') && !Orion.InJournal('You apply') && !Orion.InJournal('Chces vytvorit')) {
                Orion.Wait(200);
            }
            count--;

            if (count <= minimalCountToWarn) {
                Scripts.Utils.playerPrint(`posledni${count > 4 ? 'ch' : ''} ${count} band${count > 4 ? '' : count > 1 ? 'y' : 'a'}`, ColorEnum.red);
            }

        }

        static mysticCounter() {
            Orion.ClearJournal();
            const recepts = Orion.FindType('0x14ED', '0x06ED'); // recept
            const mystics = {...gameObject.mystics};

            for (const recept of recepts) {
                Orion.UseObject(recept);
                Orion.Wait(responseDelay);
                for (const m in mystics) {
                    !mystics[m].required && (mystics[m].required = 0);
                    const text = Orion.InJournal(m.charAt(0).toUpperCase() + m.slice(1))?.Text();
                    if (text) {
                        mystics[m].required += parseInt(text.replace(/x.*/, ''));
                    }
                }
                Orion.ClearJournal();
            }

            Orion.Print(-1 , '* zbyva doplnit *');
            for (const m in mystics) {
                const required = mystics[m].required;
                const have = Scripts.Utils.countObjectInContainer(mystics[m], 'backpack');
                const count = required - have < 0 ? 0 : required - have;
                Orion.Print(-1 , m + ': ' + count.toString());
            }
            Orion.Print(-1 , '*****************');
        }

        static hideAll() {
            Orion.Timer('resendTime') === -1 && Orion.SetTimer('resendTime', 10000);
            !Orion.GetGlobal('hideAll') && Orion.SetGlobal('hideAll', '0');
            const hidden = !!parseInt(Orion.GetGlobal('hideAll'));
            const timer = Orion.Timer('resendTime');

            if (!hidden) {
                const mobiles = Orion.FindType('any', "any", "ground", 'mobile', 15);
                for (const m of mobiles) {
                    Orion.Hide(m);
                }
                Orion.SetGlobal('hideAll', '1');
            }
            else if (timer >= 10000) {
                Scripts.Utils.resetTimer('resendTime');
                Orion.Resend();
                Orion.SetGlobal('hideAll', '0');
            }
            else {
                Scripts.Utils.log(`jeste nemuzes dat znovu resync/resend, pockej jeste ${(10000 - timer)/1000} sekund(y)`)
            }
        }

        static lavaBomb() {
            const bomb = gameObject.potions.lavabomb;
            Scripts.Potions.fillPotion(PotionsEnum.lavabomb);
            const bombSerials = Orion.FindType(bomb.graphic, bomb.color);

            if (!bombSerials.length) {
                return;
            }

            Orion.UseObject(bombSerials[0]);
        }
    }
}
