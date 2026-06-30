import re

with open('app/page.tsx', 'r') as f:
    content = f.read()

# 1. Remove imports of the deleted components
content = re.sub(r"const MosqRiskMap = dynamic\(\(\) => import\('\.\./components/MosqRiskMap'\), \{ ssr: false \}\);\n+", "", content)
content = re.sub(r"import MosqRiskPrediction from '\.\./components/MosqRiskPrediction';\n+", "", content)
content = re.sub(r"import MosqRiskReport from '\.\./components/MosqRiskReport';\n+", "", content)

# 2. Remove activeTab state
content = re.sub(r"  const \[activeTab, setActiveTab\] = useState\('Beranda'\);\n", "", content)

# 3. Replace Navigation
nav_old = """        <div className="hidden md:flex gap-8">
          <a className={`cursor-pointer transition-colors font-body-md text-body-md ${activeTab === 'Beranda' ? 'text-primary font-bold border-b-2 border-primary pb-1' : 'text-on-surface-variant hover:text-primary'}`} onClick={() => setActiveTab('Beranda')}>Beranda</a>
          <a className={`cursor-pointer transition-colors font-body-md text-body-md ${activeTab === 'Peta Risiko' ? 'text-primary font-bold border-b-2 border-primary pb-1' : 'text-on-surface-variant hover:text-primary'}`} onClick={() => setActiveTab('Peta Risiko')}>Peta Risiko</a>
          <a className={`cursor-pointer transition-colors font-body-md text-body-md ${activeTab === 'Prediksi' ? 'text-primary font-bold border-b-2 border-primary pb-1' : 'text-on-surface-variant hover:text-primary'}`} onClick={() => setActiveTab('Prediksi')}>Prediksi</a>
          <a className={`cursor-pointer transition-colors font-body-md text-body-md ${activeTab === 'Laporan' ? 'text-primary font-bold border-b-2 border-primary pb-1' : 'text-on-surface-variant hover:text-primary'}`} onClick={() => setActiveTab('Laporan')}>Laporan</a>
        </div>"""
nav_new = """        <div className="hidden md:flex gap-8">
          <a className="cursor-pointer transition-colors font-body-md text-body-md text-on-surface-variant hover:text-primary font-bold" href="#beranda">Beranda</a>
          <a className="cursor-pointer transition-colors font-body-md text-body-md text-on-surface-variant hover:text-primary font-bold" href="#tentang">Tentang Produk</a>
          <a className="cursor-pointer transition-colors font-body-md text-body-md text-on-surface-variant hover:text-primary font-bold" href="#lapor">Lapor Warga</a>
        </div>"""
content = content.replace(nav_old, nav_new)

# 4. Remove activeTab check from main content
content = content.replace("{activeTab === 'Beranda' && (", "")
content = content.replace("<main className=\"flex-grow py-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-8\">", "<main id=\"beranda\" className=\"flex-grow pt-24 pb-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-8\">\n          {/* Main Dashboard Segment */}")


# 5. Remove the other activeTab blocks entirely
import_pattern = r"\s*\{\/\* Eco Impact \*\/\}[\s\S]*?\<\/\div\>\n\s*\<\/\div\>\n\s*\<\/\>\n\s*\)\}\n\n\s*\{activeTab === 'Peta Risiko' && \([\s\S]*?\{activeTab === 'Laporan' && \([\s\S]*?\<\/\div\>\n\s*\)\}\n\s*\<\/main\>"

new_sections = """          {/* Eco Impact */}
          <div className="bg-surface-tint/5 flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-4 md:gap-6 rounded-[20px] shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 p-6 md:p-8">
            <div className="w-10 h-10 md:w-16 md:h-16 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-lg md:text-3xl">eco</span>
            </div>
            <div>
              <p className="font-body-md text-sm md:text-body-md text-on-surface-variant mb-1">Dampak Lingkungan</p>
              <p className="font-label-md text-sm md:text-label-md text-on-surface">Bulan ini, Anda telah membantu menyelamatkan <strong className="text-primary">{impactKg} kg</strong> limbah ampas nilam Aceh.</p>
            </div>
          </div>
        </div>

        {/* Tentang Produk Section */}
        <section id="tentang" className="col-span-1 lg:col-span-12 py-16 mt-8 border-t border-outline/10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Mengenal Patchmos Spray</h2>
            <p className="text-on-surface-variant max-w-2xl mx-auto text-lg">Inovasi perlindungan keluarga dari gigitan nyamuk sekaligus pahlawan lingkungan dari Serambi Mekkah.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-outline/10 text-center hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary">
                <span className="material-symbols-outlined text-4xl">eco</span>
              </div>
              <h3 className="text-xl font-bold text-on-surface mb-3">Limbah Nilam Aceh</h3>
              <p className="text-on-surface-variant">Patchmos memanfaatkan ekstrak ampas nilam (patchouli) sisa penyulingan di Aceh yang biasanya dibuang, menyulapnya menjadi minyak atsiri penolak nyamuk yang ampuh.</p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-outline/10 text-center hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary">
                <span className="material-symbols-outlined text-4xl">health_and_safety</span>
              </div>
              <h3 className="text-xl font-bold text-on-surface mb-3">Bebas DEET & Racun</h3>
              <p className="text-on-surface-variant">Diformulasikan dari bahan 100% alami. Tidak mengandung DEET atau bahan kimia keras lainnya sehingga sangat aman untuk kulit sensitif dan anak-anak.</p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-outline/10 text-center hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary">
                <span className="material-symbols-outlined text-4xl">radar</span>
              </div>
              <h3 className="text-xl font-bold text-on-surface mb-3">Sistem AI Terintegrasi</h3>
              <p className="text-on-surface-variant">Tidak hanya menjual spray, Patchmos terhubung langsung dengan sistem peringatan dini (Early Warning System) MosqRisk untuk mengingatkan Anda kapan nyamuk menyerang.</p>
            </div>
          </div>
        </section>

        {/* Laporan Warga Section */}
        <section id="lapor" className="col-span-1 lg:col-span-12 py-16 mb-8 border-t border-outline/10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6">Laporkan Kasus & Jentik</h2>
              <p className="text-on-surface-variant text-lg mb-6 leading-relaxed">
                Jadilah mata dan telinga untuk lingkungan Anda. Laporan Anda langsung terhubung ke dasbor pantauan dan membantu AI kami memperingatkan warga sekitar agar lebih waspada.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-on-surface"><span className="material-symbols-outlined text-green-500">check_circle</span> Laporkan genangan air/jentik.</li>
                <li className="flex items-center gap-3 text-on-surface"><span className="material-symbols-outlined text-green-500">check_circle</span> Laporkan kasus suspect DBD.</li>
                <li className="flex items-center gap-3 text-on-surface"><span className="material-symbols-outlined text-green-500">check_circle</span> Bantu warga lain tetap aman.</li>
              </ul>
            </div>
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-lg border border-outline/10">
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                fetch('http://localhost:8000/api/reports', {
                  method: 'POST',
                  headers: {'Content-Type': 'application/json'},
                  body: JSON.stringify({
                    location_name: formData.get('location') || 'Tidak Diketahui',
                    description: formData.get('description'),
                    reporter_name: formData.get('name'),
                    reporter_contact: formData.get('contact'),
                    report_type: formData.get('type')
                  })
                }).then(res=>res.json()).then(data=>{
                  if(data.success) {
                    alert('Laporan berhasil dikirim! Terima kasih atas kontribusi Anda.');
                    (e.target as HTMLFormElement).reset();
                  } else {
                    alert('Gagal mengirim laporan.');
                  }
                });
              }} className="flex flex-col gap-4">
                <input type="text" name="name" required placeholder="Nama Anda" className="w-full bg-background border border-outline/30 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary" />
                <input type="text" name="contact" required placeholder="Email / No HP" className="w-full bg-background border border-outline/30 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary" />
                <input type="text" name="location" required placeholder="Lokasi Temuan (Contoh: Jl. Merdeka)" className="w-full bg-background border border-outline/30 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary" />
                <select name="type" required className="w-full bg-background border border-outline/30 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary">
                  <option value="JENTIK">Temuan Sarang / Jentik Nyamuk</option>
                  <option value="DBD">Kasus Suspect DBD</option>
                  <option value="LAINNYA">Lainnya</option>
                </select>
                <textarea name="description" required placeholder="Deskripsi Singkat" rows={3} className="w-full bg-background border border-outline/30 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary"></textarea>
                <button type="submit" className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-primary/90 transition-colors mt-2">Kirim Laporan</button>
              </form>
            </div>
          </div>
        </section>
        </main>"""

content = re.sub(import_pattern, new_sections, content)

with open('app/page.tsx', 'w') as f:
    f.write(content)

