import puppeteer from 'puppeteer';

interface ScrapeResult {
    success: boolean;
    data?: {
        eventos: string[];
        pedidos: string[];
        tareas?: string[];
        usuarios?: { login: string; nombre: string; tipo: string; rawRow: string; cells: string[] }[];
        timestamp: string;
    };
    error?: string;
}

export async function scrapeCRMData(username: string, password: string): Promise<ScrapeResult> {
    let browser;
    try {
        console.log('Starting scraper...');
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--no-zygote']
        });

        const page = await browser.newPage();
        page.setDefaultNavigationTimeout(60000);

        // 1. Login
        console.log('Logging in...');
        await page.goto('https://engloba.crmsmi.com/sm/acceso.asp', { waitUntil: 'networkidle0' });
        await page.type('input[name="login"]', username);
        await page.type('input[name="password"]', password);

        await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle0' }),
            page.click('input[type="submit"]')
        ]);

        if (page.url().includes('acceso.asp')) {
            const errorText = await page.evaluate(() => document.body.innerText);
            if (errorText.includes('incorrecto') || errorText.includes('failed')) {
                throw new Error('Login failed: Invalid credentials');
            }
            throw new Error('Login failed: Still on login page');
        }

        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const formatDate = (date: Date) => {
            const d = new Date(date);
            d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
            return d.toISOString().split('T')[0];
        };

        // 2. Scrape Eventos
        console.log('Scraping Eventos (Read-Only)...');
        await page.goto('https://engloba.crmsmi.com/sm/agenda/listados/fmodificar.asp', { waitUntil: 'networkidle2' });

        await page.evaluate((start: string, end: string) => {
            const fdesde = document.querySelector<HTMLInputElement>('input[name="fdesde"]');
            if (fdesde) {
                fdesde.value = start;
                document.querySelector<HTMLInputElement>('input[name="fhasta"]')!.value = end;
                const checkFrom = document.querySelector<HTMLInputElement>('input[name="desde"]');
                if (checkFrom) checkFrom.checked = true;
                const checkTo = document.querySelector<HTMLInputElement>('input[name="hasta"]');
                if (checkTo) checkTo.checked = true;
            } else {
                const mfdesde = document.querySelector<HTMLInputElement>('input[name="mfdesde"]');
                if (mfdesde) {
                    mfdesde.value = start;
                    document.querySelector<HTMLInputElement>('input[name="mfhasta"]')!.value = end;
                    const checkFrom = document.querySelector<HTMLInputElement>('input[name="cmfdesde"]');
                    if (checkFrom) checkFrom.checked = true;
                    const checkTo = document.querySelector<HTMLInputElement>('input[name="cmfhasta"]');
                    if (checkTo) checkTo.checked = true;
                }
            }
            const btn = document.querySelector<HTMLInputElement>('input[type="submit"][value="Buscar"]');
            if (btn) btn.click();
            else (document.forms[0] as HTMLFormElement).submit();
        }, formatDate(startOfMonth), formatDate(today));

        await page.waitForNavigation({ waitUntil: 'networkidle2' });

        const eventos = await page.evaluate(() => {
            const rows = Array.from(document.querySelectorAll('tr'));
            return rows.filter(r => r.cells.length > 5).map(r => r.innerText);
        });

        await new Promise(r => setTimeout(r, 2000));

        // 3. Scrape Pedidos
        console.log('Scraping Pedidos (Read-Only)...');
        await page.goto('https://engloba.crmsmi.com/sm/pedidos/mod/fmodificar.asp', { waitUntil: 'networkidle2' });

        await page.evaluate((start: string, end: string) => {
            const fdesde = document.querySelector<HTMLInputElement>('input[name="fdesde"]');
            if (fdesde) {
                fdesde.value = start;
                document.querySelector<HTMLInputElement>('input[name="fhasta"]')!.value = end;
                const checkFrom = document.querySelector<HTMLInputElement>('input[name="desde"]');
                if (checkFrom) checkFrom.checked = true;
                const checkTo = document.querySelector<HTMLInputElement>('input[name="hasta"]');
                if (checkTo) checkTo.checked = true;
            }
            const btn = document.querySelector<HTMLInputElement>('input[type="submit"][value="Buscar"]');
            if (btn) btn.click();
            else (document.querySelector('form[name="ped_mod"]') as HTMLFormElement).submit();
        }, formatDate(startOfMonth), formatDate(today));

        await page.waitForNavigation({ waitUntil: 'networkidle2' });

        const pedidos = await page.evaluate(() => {
            const rows = Array.from(document.querySelectorAll('tr'));
            return rows.filter(r => r.cells.length > 5).map(r => r.innerText);
        });

        // 4. Scrape Tareas (TELEOPERADORAS)
        console.log('Scraping Tareas (Read-Only)...');
        await page.goto('https://engloba.crmsmi.com/sm/tareas/mod/fmodificar.asp', { waitUntil: 'networkidle2' });

        await page.evaluate((start: string, end: string) => {
            const ffdesde = document.querySelector<HTMLInputElement>('input[name="ffdesde"]');
            if (ffdesde) ffdesde.value = start;

            const ffhasta = document.querySelector<HTMLInputElement>('input[name="ffhasta"]');
            if (ffhasta) ffhasta.value = end;

            const ddesde = document.querySelector<HTMLInputElement>('input[name="ddesde"]');
            if (ddesde) ddesde.checked = true;

            const hhasta = document.querySelector<HTMLInputElement>('input[name="hhasta"]');
            if (hhasta) hhasta.checked = true;

            const equipo = document.querySelector<HTMLSelectElement>('select[name="equipo"]');
            if (equipo) equipo.value = "6"; // 6 = TELEOPERADORAS

            const cequipo = document.querySelector<HTMLInputElement>('input[name="cequipo"]');
            if (cequipo) cequipo.checked = true;

            const fdesde = document.querySelector<HTMLInputElement>('input[name="fdesde"]');
            if (fdesde) fdesde.value = "";

            // Inject n_reg and bdatos to bypass 1000 record limit
            let n_reg = document.querySelector<HTMLInputElement>('input[name="n_reg"]');
            if (!n_reg && document.forms.length > 0) {
                n_reg = document.createElement('input');
                n_reg.type = 'hidden';
                n_reg.name = 'n_reg';
                document.forms[0].appendChild(n_reg);
            }
            if (n_reg) n_reg.value = "10000";

            let bdatos = document.querySelector<HTMLInputElement>('input[name="bdatos"]');
            if (!bdatos && document.forms.length > 0) {
                bdatos = document.createElement('input');
                bdatos.type = 'hidden';
                bdatos.name = 'bdatos';
                document.forms[0].appendChild(bdatos);
            }
            if (bdatos) bdatos.value = "10000";

            if (document.forms.namedItem('btareas')) {
                (document.forms.namedItem('btareas') as HTMLFormElement).submit();
            } else if (typeof (window as any).buscar === 'function') {
                (window as any).buscar(0);
            } else {
                const btn = document.querySelector<HTMLInputElement>('input[type="submit"][value="Buscar"]');
                if (btn) btn.click();
                else if (document.forms.length > 0) (document.forms[0] as HTMLFormElement).submit();
            }
        }, formatDate(startOfMonth), formatDate(today));

        await page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {});
        await new Promise(r => setTimeout(r, 3000));

        const tareas = await page.evaluate(() => {
            const rows = Array.from(document.querySelectorAll('tr'));
            return rows.filter(r => r.cells.length > 5 && r.innerText.trim().length > 10).map(r => r.innerText);
        });

        // 5. Scrape Usuarios
        console.log('Scraping Usuarios (Read-Only)...');
        await page.goto('https://engloba.crmsmi.com/sm/usuarios/mod/fmodificar.asp', { waitUntil: 'networkidle2' });

        await page.evaluate(() => {
            const btn = document.querySelector<HTMLInputElement>('input[type="submit"][value="Buscar"]');
            if (btn) btn.click();
            else if (document.forms.length > 0) document.forms[0].submit();
        });

        await new Promise(r => setTimeout(r, 4000));

        const usuarios = await page.evaluate(() => {
            const rows = Array.from(document.querySelectorAll('tr'));
            return rows.slice(1).map(r => {
                const cells = Array.from(r.cells).map(c => c.innerText.trim());
                // Column order: | Código | Foto | Login | Nombre | Tipo | Teléfono |
                const login = cells.length > 3 ? cells[3] : '';
                const nombre = cells.length > 4 ? cells[4] : '';
                const tipo = cells.length > 5 ? cells[5] : '';
                const rawRow = r.innerText.trim();
                return { login, nombre, tipo, rawRow, cells };
            }).filter(u => u.nombre !== '' && !u.nombre.includes('Nombre') && u.cells.length > 2);
        });

        console.log(`Scraped ${eventos.length} events, ${pedidos.length} orders, ${tareas.length} tareas, ${usuarios.length} users.`);

        return {
            success: true,
            data: {
                eventos,
                pedidos,
                tareas,
                usuarios,
                timestamp: new Date().toISOString()
            }
        };

    } catch (error: any) {
        console.error('Scraping failed:', error);
        return {
            success: false,
            error: error.message
        };
    } finally {
        if (browser) await browser.close();
    }
}
