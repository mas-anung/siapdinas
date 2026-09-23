  // ================= MESIN CERDAS MOCK RUNNER (DEMO AK STUDIO) =================
  if (typeof window.google === "undefined" || !window.google.script) {
    window.google = window.google || {};
    window.google.script = {
      run: (function() {
        function createRunner(successCb, failCb) {
          return new Proxy({}, {
            get: function(t, method) {
              return function() {
                var args = Array.prototype.slice.call(arguments);
                setTimeout(function() {
                  if (!successCb) return;

                  if (method === "prosesLogin" || method === "verifikasiLogin") {
                    var b = args[0] || "Akuntansi", p = args[1];
                    if (p && p.length >= 4) {
                      successCb({ status: "sukses", bidang: b });
                    } else {
                      successCb({ status: "gagal", pesan: "Password demo minimal 4 karakter (misal: 1234)!" });
                    }
                  } else if (method === "generateIdOtomatis") {
                    successCb((args[0] === "Dalam Daerah" ? "DD-" : "LD-") + "001 (DEMO)");
                  } else if (method === "ambilSemuaNamaPegawai") {
                    successCb(["BUDI SANTOSO, S.E.", "SITI AMINAH, S.Sos", "AHMAD FAUZI, S.E.", "EKO PRASETYO, S.T."]);
                  } else if (method === "ambilSemuaKotaTujuan") {
                    successCb(["Surabaya", "Jakarta", "Semarang", "Yogyakarta", "Madiun", "Bandung", "Malang"]);
                  } else if (method === "ambilSemuaKecamatan") {
                    successCb(["Magetan", "Plaosan", "Panekan", "Kawedanan", "Karangrejo", "Maospati"]);
                  } else if (method === "ambilAnggaranPerBidang") {
                    successCb([{ kode: "5.1.02.04.01.0001", uraian: "Belanja Perjalanan Dinas Biasa" }]);
                  } else if (method === "getScriptUrl") {
                    // KETIKA CETAK DIKLIK -> LANGSUNG MEMBUKA DRIVE BITLY RESMI AK STUDIO
                    successCb("https://bit.ly/4yNQu6N");
                  } else if (method === "simpanSuratTugas") {
                    successCb({ status: "sukses", idPertama: "LD-001 (DEMO)", pesan: "Berhasil disimpan ke Memori Demo!" });
                  } else if (method === "ambilDataRekap") {
                    successCb([
                      { noId: "LD-001", nama: "BUDI SANTOSO, S.E.", tujuan: "Surabaya", tglDinas: "2026-09-20", lama: "2 Hari", statusSpj: "SPJ Rampung" },
                      { noId: "LD-002", nama: "SITI AMINAH, S.Sos", tujuan: "Yogyakarta", tglDinas: "2026-09-22", lama: "3 Hari", statusSpj: "Belum SPJ" }
                    ]);
                  } else {
                    successCb({ status: "sukses", pesan: "Fitur aktif dalam mode showcase" });
                  }
                }, 50);
              };
            }
          });
        }
        return new Proxy({}, {
          get: function(target, prop) {
            if (prop === "withSuccessHandler") {
              return function(successCb) {
                return new Proxy({}, {
                  get: function(t2, method) {
                    if (method === "withFailureHandler") {
                      return function(failCb) { return createRunner(successCb, failCb); };
                    }
                    return function() {
                      var args = Array.prototype.slice.call(arguments);
                      createRunner(successCb, null)[method].apply(null, args);
                    };
                  }
                });
              };
            }
            return function() {
              var args = Array.prototype.slice.call(arguments);
              createRunner(null, null)[prop].apply(null, args);
            };
          }
        });
      })()
    };
  }

  var bidangTerlogin = "";
  var idBerkasAktif = "";
  var idTargetCetakSppd = "";

  /* ================= HELPER RENDER LUCIDE ================= */
  function refreshIcons() {
    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  }

  /* ================= HELPER LOADING SPINNER UNIVERSAL ================= */
  function setBtnLoading(btnId, isLoading, loadingText) {
    var btn = typeof btnId === "string" ? document.getElementById(btnId) : btnId;
    if (!btn) return;

    if (isLoading) {
      btn.dataset.originalContent = btn.innerHTML;
      btn.disabled = true;
      btn.classList.add("opacity-60", "cursor-not-allowed");
      btn.innerHTML = `
        <svg class="animate-spin h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg>
        <span>${loadingText || "Memproses..."}</span>
      `;
    } else {
      btn.disabled = false;
      btn.classList.remove("opacity-60", "cursor-not-allowed");
      if (btn.dataset.originalContent) {
        btn.innerHTML = btn.dataset.originalContent;
      }
      refreshIcons();
    }
  }

  /* ================= BANNER TOAST NOTIFIKASI MODERN ================= */
  function showToast(pesan, tipe) {
    var toast = document.getElementById("toastNotif");
    var msg = document.getElementById("toastMsg");
    var icon = document.getElementById("toastIcon");
    if (!toast) return;

    var textPesan = String(pesan || "");
    msg.innerText = textPesan;

    var isErr = (tipe === "error" || 
      textPesan.toLowerCase().includes("gagal") || 
      textPesan.toLowerCase().includes("salah") || 
      textPesan.toLowerCase().includes("error") || 
      textPesan.toLowerCase().includes("peringatan") || 
      textPesan.toLowerCase().includes("keliru") || 
      textPesan.toLowerCase().includes("harus") || 
      textPesan.toLowerCase().includes("belum"));

    if (isErr) {
      icon.innerHTML = '<i data-lucide="alert-triangle" class="w-4 h-4 text-rose-400"></i>';
      toast.className = "fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-slate-900 border text-xs font-bold shadow-2xl flex items-center gap-2.5 transition-all duration-300 border-rose-500/60 text-rose-300 shadow-rose-500/20";
    } else {
      icon.innerHTML = '<i data-lucide="check-circle" class="w-4 h-4 text-emerald-400"></i>';
      toast.className = "fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-slate-900 border text-xs font-bold shadow-2xl flex items-center gap-2.5 transition-all duration-300 border-emerald-500/60 text-emerald-300 shadow-emerald-500/20";
    }

    refreshIcons();
    toast.classList.remove("hidden");
    if (window.toastTimeout) clearTimeout(window.toastTimeout);
    window.toastTimeout = setTimeout(function() { toast.classList.add("hidden"); }, 3000);
  }

  window.alert = function(pesan) {
    showToast(pesan);
  };

  function bukaModalBranding() {
    document.getElementById("modalBranding").classList.remove("hidden");
    refreshIcons();
  }

  function tutupModalBranding() {
    document.getElementById("modalBranding").classList.add("hidden");
  }

  // SAKLAR SILUMAN: KLIK 2X DI LOGO PEMDA MAGETAN LANGSUNG MASUK JALUR ADMIN
  function rahasiaLoginAdmin() {
    var selectBidang = document.getElementById("login-bidang");
    if (!selectBidang) return;

    // Suntik opsi tersembunyi yang TIDAK TERLIHAT di daftar dropdown
    var optAdmin = selectBidang.querySelector('option[value="Admin"]');
    if (!optAdmin) {
      optAdmin = document.createElement("option");
      optAdmin.value = "Admin";
      optAdmin.textContent = "-- Pilih Bidang Sesuai Database --";
      optAdmin.style.display = "none";
      selectBidang.appendChild(optAdmin);
    }

    // Pilih Admin secara ghaib di balik layar
    selectBidang.value = "Admin";

    // Kursor otomatis loncat aktif & kedip di kotak password!
    var passInput = document.getElementById("login-pass");
    if (passInput) {
      passInput.focus();
      passInput.select();
    }
  }

  /* ================= SISTEM PENGATUR TAB & LOGIN ================= */
  function bukaTab(evt, namaTab) {
    try {
      var i, tabcontent, tablinks;
      tabcontent = document.getElementsByClassName("tab-content");
      for (i = 0; i < tabcontent.length; i++) tabcontent[i].classList.add("hidden");
      for (i = 0; i < tabcontent.length; i++) tabcontent[i].classList.remove("active");
      
      var targetEl = document.getElementById(namaTab);
      if (targetEl) {
        targetEl.classList.remove("hidden");
        targetEl.classList.add("active");
      }
      
      tablinks = document.getElementsByClassName("tab-link");
      for (i = 0; i < tablinks.length; i++) {
        tablinks[i].classList.remove("bg-slate-800", "shadow-sm", "text-white", "font-bold");
        tablinks[i].classList.add("text-slate-400");
      }
      
      if (evt && evt.currentTarget && evt.currentTarget.classList) {
        evt.currentTarget.classList.add("bg-slate-800", "shadow-sm", "text-white", "font-bold");
        evt.currentTarget.classList.remove("text-slate-400");
      }
      
      // Auto-load data saat tab dibuka
      if (namaTab === 'menu-rekap') {
        muatRekapBulanBerjalan();
      }
      if (namaTab === 'menu-setting-bidang') {
        muatSettingPejabatBidang();
      }
      if (namaTab === 'menu-settings') {
        if (typeof muatMasterPegawai === "function") muatMasterPegawai();
        if (typeof terapkanStatusGembok === "function") terapkanStatusGembok();
      }
      refreshIcons();
    } catch(e) {
      console.log("Tab error:", e);
    }
  }

  /* ================= FUNGSI 3 SUB-TAB HORIZONTAL ADMIN ================= */
  function bukaSubTabAdmin(evt, namaSubTab) {
    var subContents = document.getElementsByClassName("admin-subtab-content");
    for (var i = 0; i < subContents.length; i++) {
      subContents[i].classList.add("hidden");
      subContents[i].classList.remove("active");
    }

    var targetSub = document.getElementById(namaSubTab);
    if (targetSub) {
      targetSub.classList.remove("hidden");
      targetSub.classList.add("active");
    }

    var subLinks = document.getElementsByClassName("admin-subtab-link");
    for (var j = 0; j < subLinks.length; j++) {
      subLinks[j].classList.remove("bg-slate-800", "text-white");
      subLinks[j].classList.add("text-slate-400");
    }

    if (evt && evt.currentTarget) {
      evt.currentTarget.classList.add("bg-slate-800", "text-white");
      evt.currentTarget.classList.remove("text-slate-400");
    }

    if (namaSubTab === 'subAdmin-pegawai') {
      muatMasterPegawai();
    }
    if (namaSubTab === 'subAdmin-instansi') {
      muatSettingInstansi();
    }
    refreshIcons();
  }

  document.addEventListener("DOMContentLoaded", function() {
    var firstTabBtn = document.querySelector(".tab-link");
    if(firstTabBtn) {
      firstTabBtn.classList.add("bg-slate-800", "shadow-sm", "text-white", "font-bold");
      firstTabBtn.classList.remove("text-slate-400");
    }
    refreshIcons();
  });

  function aksiLogin() {
    var bidang = document.getElementById("login-bidang").value;
    var pass = document.getElementById("login-pass").value;

    if (!bidang || !pass) { 
      alert("Peringatan: Pilihan bidang dan password tidak boleh kosong!"); 
      return; 
    }

    setBtnLoading("btn-login", true, "Memverifikasi...");

    google.script.run
      .withSuccessHandler(function(res) {
        setBtnLoading("btn-login", false);
        try {
          if (res.status === "sukses") {
            bidangTerlogin = res.bidang;
            document.getElementById("user-aktif").innerText = bidangTerlogin;
            
            var tabBtnSettings = document.getElementById("tabBtn-settings");
            var tabBtnSettingBidang = document.getElementById("tabBtn-setting-bidang");
            var tabBtnSppd = document.getElementById("tabBtn-sppd");
            var tabBtnSpj = document.getElementById("tabBtn-spj");
            var tabBtnRekap = document.getElementById("tabBtn-rekap");

            if (bidangTerlogin === "Admin") {
              // Jika login sebagai Admin / AK Studio
              isOtoritasTerbuka = true;
              if (tabBtnSppd) tabBtnSppd.style.display = "none";
              if (tabBtnSpj) tabBtnSpj.style.display = "none";
              if (tabBtnRekap) tabBtnRekap.style.display = "inline-block";
              if (tabBtnSettingBidang) tabBtnSettingBidang.style.display = "none";
              if (tabBtnSettings) tabBtnSettings.style.display = "inline-flex";
              
              bukaTab({ currentTarget: tabBtnSettings }, 'menu-settings');
            } else {
              // Jika login sebagai Akun Bidang (Akuntansi, Anggaran, dll)
              if (tabBtnSppd) tabBtnSppd.style.display = "inline-block";
              if (tabBtnSpj) tabBtnSpj.style.display = "inline-block";
              if (tabBtnRekap) tabBtnRekap.style.display = "inline-block";
              if (tabBtnSettings) tabBtnSettings.style.display = "none";
              if (tabBtnSettingBidang) tabBtnSettingBidang.style.display = "inline-flex"; // TAMPILKAN SETTING BIDANG!

              bukaTab({ currentTarget: tabBtnSppd }, 'menu-sppd');
            }

            document.getElementById("login-box").classList.add("hidden");
            document.getElementById("main-application").classList.remove("hidden");
            
            if (typeof muatDropdownOtomatis === "function") muatDropdownOtomatis();
            if (typeof gantiCakupanWilayah === "function") gantiCakupanWilayah("Luar Daerah");
            refreshIcons();
          } else {
            alert(res.pesan || "Password salah!");
          }
        } catch(err) {
          console.error("Login Handler Error:", err);
          alert("Terjadi kendala saat memuat dashboard: " + err.message);
        }
      })
      .withFailureHandler(function(errServer) {
        setBtnLoading("btn-login", false);
        alert("Gagal Login ke Server: " + errServer.message);
      })
      .prosesLogin(bidang, pass);
  }

  function hitungHariAwal() {
    var tgl1 = document.getElementById("tglBerangkat").value;
    var tgl2 = document.getElementById("tglKembali").value;
    if(tgl1 && tgl2) {
      var hari = ((new Date(tgl2).getTime() - new Date(tgl1).getTime()) / (1000 * 3600 * 24)) + 1;
      if(hari > 0) {
        document.getElementById("lamaHari").value = hari + " Hari";
      } else {
        alert("Kekeliruan: Tanggal kembali mendahului tanggal berangkat!");
        document.getElementById("tglKembali").value = "";
        document.getElementById("lamaHari").value = "";
      }
    }
  }

  function initPegawaiST() {
    var container = document.getElementById("container-pegawai-st");
    if (container) {
      container.innerHTML = "";
      tambahBarisPegawaiST();
    }
  }

  function tambahBarisPegawaiST() {
    var container = document.getElementById("container-pegawai-st");
    var div = document.createElement("div");
    div.className = "flex gap-2 items-center row-pegawai-st mb-2";

    div.innerHTML = `
      <div class="flex-1">
        <input type="text" list="datalist-pegawai-st" class="st-nama-pegawai w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:ring-2 focus:ring-blue-600" placeholder="Ketik awalan nama atau klik untuk memilih..." required autocomplete="off">
      </div>
      <div>
        <button type="button" class="p-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center" onclick="hapusBarisPegawaiST(this)" title="Hapus Pegawai">
          <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
      </div>
    `;
    container.appendChild(div);
    refreshIcons();
  }

  function hapusBarisPegawaiST(btn) {
    var container = document.getElementById("container-pegawai-st");
    if (container.getElementsByClassName("row-pegawai-st").length <= 1) {
      alert("Peringatan: Minimal harus ada 1 pegawai yang ditugaskan!");
      return;
    }
    btn.closest(".row-pegawai-st").remove();
  }

  function aksiSimpanSuratTugas() {
    var form = document.getElementById("formSuratTugas");
    if(!form.checkValidity()) {
      alert("Peringatan: Harap lengkapi semua data wajib pada formulir!");
      return;
    }
    
    var listPegawai = [];
    var rowElements = document.querySelectorAll(".row-pegawai-st");
    rowElements.forEach(function(row) {
      var nama = row.querySelector(".st-nama-pegawai").value;
      if (nama) listPegawai.push(nama);
    });

    if (listPegawai.length === 0) {
      alert("Peringatan: Minimal pilih 1 pegawai yang ditugaskan!");
      return;
    }

    var radioCakupan = document.querySelector('input[name="cakupanWilayah"]:checked');
    var cakupan = radioCakupan ? radioCakupan.value : "Luar Daerah";
    var daerahTujuanFinal = "";

    if (cakupan === "Luar Daerah") {
      daerahTujuanFinal = document.getElementById("daerahTujuanLuar").value;
      if (!daerahTujuanFinal) { alert("Pilih Kota Tujuan Luar Daerah!"); return; }
    } else {
      var kec = document.getElementById("daerahKecamatan").value;
      var desa = document.getElementById("daerahDesa").value;
      if (!kec) { alert("Pilih Kecamatan Tujuan!"); return; }
      daerahTujuanFinal = desa ? (desa + " Kec. " + kec) : ("Kec. " + kec);
    }

    var dataKirim = {
      noId: document.getElementById("noId").value,
      noSuratTugas: document.getElementById("noSuratTugas").value,
      tglSuratTugas: document.getElementById("tglSuratTugas").value,
      mataAnggaran: document.getElementById("mataAnggaran").value,
      modaTransportasi: document.getElementById("modaTransportasi").value,
      listPegawai: listPegawai,
      dasarSuratTugas: document.getElementById("dasarSuratTugas").value,
      keperluan: document.getElementById("keperluan").value,
      cakupanWilayah: cakupan,
      daerahTujuan: daerahTujuanFinal,
      tglBerangkat: document.getElementById("tglBerangkat").value,
      tglKembali: document.getElementById("tglKembali").value,
      bidang: bidangTerlogin
    };

    setBtnLoading("btn-simpan-st", true, "Menyimpan ke Sheets...");

    google.script.run
      .withSuccessHandler(function(res) {
        setBtnLoading("btn-simpan-st", false);
        if(res.status === "sukses") {
          idBerkasAktif = res.idPertama;
          alert(res.pesan);
          
          document.getElementById("formSuratTugas").reset();
          document.getElementById("noSuratTugas").value = "800/\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0/403.201/2026";
          initPegawaiST();
          gantiCakupanWilayah("Luar Daerah");
        } else {
          alert("Gagal: " + res.pesan);
        }
      })
      .withFailureHandler(function(err) {
        setBtnLoading("btn-simpan-st", false);
        alert("Error: " + err.message);
      })
      .simpanSuratTugas(dataKirim);
  }

  function jalanCetakSuratTugas() {
    var id = idBerkasAktif || document.getElementById("noId").value;
    if (!id) {
      alert("Peringatan: Simpan data Surat Tugas terlebih dahulu untuk mencetak!");
      return;
    }
    bukaModalPilihTtdSpt(id);
  }

  function jalanCetakSppdLangsung() {
    var id = idBerkasAktif || document.getElementById("noId").value;
    if (!id) {
      alert("Peringatan: Simpan data Surat Tugas terlebih dahulu untuk mencetak SPPD!");
      return;
    }

    var pakaiPengikut = document.getElementById("modePengikut").checked ? "1" : "0";
    
    google.script.run.withSuccessHandler(function(url) {
      var linkAkses = url + "?id=" + id + "&type=sppd&pengikut_mode=" + pakaiPengikut;
      window.open(linkAkses, '_blank');
    }).getScriptUrl();
  }

  /* ================= HELPER FORMAT RIBUAN ================= */
  function formatRibuanInput(el) {
    var val = el.value.replace(/[^0-9]/g, "");
    if (!val) { el.value = "0"; return; }
    el.value = Number(val).toLocaleString("id-ID");
    hitungMekanikSpj();
  }

  function ambilAngkaMurni(idEl) {
    var el = document.getElementById(idEl);
    if (!el) return 0;
    var str = String(el.value || "").replace(/[^0-9]/g, "");
    return Number(str) || 0;
  }

  function setAngkaRibuan(idEl, val) {
    var el = document.getElementById(idEl);
    if (!el) return;
    el.value = Number(val || 0).toLocaleString("id-ID");
  }

  /* ================= MANAJEMEN SPJ KEUANGAN ================= */
  var cacheRombonganSpj = [];

  function aksiAmbilSppdForSpj() {
    var idInput = document.getElementById("cariNoIdSpj");
    var id = idInput ? idInput.value.trim() : "";
    if (!id) { 
      alert("Peringatan: Masukkan No ID Berkas yang ingin dicari!"); 
      return; 
    }
    
    setBtnLoading("btn-cari-spj", true, "Mencari data...");

    google.script.run
      .withSuccessHandler(function(res) {
        setBtnLoading("btn-cari-spj", false);
        if (!res || res.status !== "ditemukan") {
          alert(res ? res.pesan : "No ID Berkas tidak ditemukan.");
          return;
        }

        cacheRombonganSpj = res.list || [];

        var selectPptk = document.getElementById("pilihPptkSpj");
        if (selectPptk) {
          selectPptk.innerHTML = "";
          var listPptk = res.listPptk || [];
          if (listPptk.length === 0) {
            selectPptk.innerHTML = '<option value="">-- Belum ada PPTK terdaftar untuk Bidang ini --</option>';
          } else {
            listPptk.forEach(function(p, idx) {
              var opt = document.createElement("option");
              opt.value = JSON.stringify({ nama: p.nama, nip: p.nip });
              opt.textContent = (idx + 1) + ". " + p.nama;
              selectPptk.appendChild(opt);
            });
          }
        }

        if (cacheRombonganSpj.length === 1) {
          muatDataSpjPegawaiTerpilih(cacheRombonganSpj[0]);
        } else {
          bukaModalPilihPegawaiSpj();
        }
      })
      .withFailureHandler(function(err) {
        setBtnLoading("btn-cari-spj", false);
        alert("Gagal memuat SPJ: " + err.message);
      })
      .cariSppdForSpj(id);
  }

  function tutupModalPilihPegawaiSpj() {
    var m = document.getElementById("modalPilihPegawaiSpj");
    if (m) m.classList.add("hidden");
  }

  function bukaModalPilihPegawaiSpj() {
    var container = document.getElementById("container-list-rombongan-spj");
    if (!container) return;
    container.innerHTML = "";

    cacheRombonganSpj.forEach(function(item, idx) {
      var statusBadge = item.isSpjDone 
        ? '<div class="text-right space-y-1">' +
            '<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold tracking-wide"><i data-lucide="check-circle-2" class="w-3 h-3"></i> SPJ Rampung</span>' +
            '<div class="text-xs font-mono font-bold text-emerald-400">Rp ' + Number(item.totalBiaya).toLocaleString("id-ID") + '</div>' +
          '</div>'
        : '<div class="text-right">' +
            '<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold tracking-wide"><i data-lucide="clock" class="w-3 h-3"></i> Belum SPJ</span>' +
          '</div>';

      var div = document.createElement("div");
      div.className = "p-3.5 bg-slate-950/80 border border-slate-800 hover:border-blue-500/60 rounded-2xl flex items-center justify-between gap-4 cursor-pointer transition-all hover:bg-slate-900 hover:scale-[1.008]";
      div.onclick = function() {
        var selectPptk = document.getElementById("pilihPptkSpj");
        if (selectPptk && selectPptk.value) {
          try {
            item.pptkTerpilih = JSON.parse(selectPptk.value);
          } catch(e) {}
        }
        
        tutupModalPilihPegawaiSpj();
        muatDataSpjPegawaiTerpilih(item);
      };

      div.innerHTML = `
        <div class="flex-1 min-w-0 pr-2">
          <div class="text-xs sm:text-sm font-bold text-white truncate">${idx + 1}. ${item.nama}</div>
          <div class="text-[11px] text-slate-400 font-mono mt-0.5">NIP. ${item.nip || '-'}</div>
        </div>
        <div class="shrink-0">
          ${statusBadge}
        </div>
      `;
      container.appendChild(div);
    });

    var m = document.getElementById("modalPilihPegawaiSpj");
    if (m) m.classList.remove("hidden");
    refreshIcons();
  }

  function formatKeTglPendek(str) {
    if (!str || str === "-") return "-";
    var bulanMap = {
      "januari": "01", "februari": "02", "maret": "03", "april": "04",
      "mei": "05", "juni": "06", "juli": "07", "agustus": "08",
      "september": "09", "oktober": "10", "november": "11", "desember": "12"
    };

    var parts = str.toString().trim().split(/\s+/);
    if (parts.length >= 3) {
      var tgl = ("0" + parts[0]).slice(-2);
      var bln = bulanMap[parts[1].toLowerCase()] || "01";
      var thn = parts[2];
      return tgl + "-" + bln + "-" + thn;
    }

    if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
      var p = str.split("-");
      return p[2].substring(0, 2) + "-" + p[1] + "-" + p[0];
    }
    return str;
  }

  function muatDataSpjPegawaiTerpilih(item) {
    if (!item) return;

    var elIdHidden = document.getElementById("spjNoId");
    if (elIdHidden) elIdHidden.value = item.noId || "";

    var elNamaHidden = document.getElementById("spjNamaPegawai");
    if (elNamaHidden) elNamaHidden.value = item.nama || "";

    var elInfoNama = document.getElementById("spjInfoNama");
    if (elInfoNama) elInfoNama.innerText = item.nama || "-";

    var elInfoKeperluan = document.getElementById("spjInfoKeperluan");
    if (elInfoKeperluan) elInfoKeperluan.innerText = item.keperluan || "-";

    var elInfoTujuan = document.getElementById("spjInfoTujuan");
    if (elInfoTujuan) elInfoTujuan.innerText = item.tujuan || "-";

    var tgl1 = formatKeTglPendek(item.tglBerangkat);
    var tgl2 = formatKeTglPendek(item.tglKembali);
    var lama = item.lamaHari ? item.lamaHari.toString().replace(/[^0-9]/g, "") : "1";

    var teksWaktu = (tgl1 === tgl2) 
      ? (tgl1 + " (" + lama + " Hari)") 
      : (tgl1 + " s/d " + tgl2 + " (" + lama + " Hari)");

    var elInfoWaktu = document.getElementById("spjInfoWaktu");
    if (elInfoWaktu) elInfoWaktu.innerText = teksWaktu;

    document.getElementById("formSpjSusulan").reset();
    if (elIdHidden) elIdHidden.value = item.noId || "";
    if (elNamaHidden) elNamaHidden.value = item.nama || "";

    var s = item.spj || {};
    setAngkaRibuan("spjUangPerHari", s.uangPerHari || 0);
    setAngkaRibuan("spjUangRepresentasi", s.uangRepresentasi || 0);
    
    var elHotel = document.getElementById("spjNamaPenginapan");
    if (elHotel) elHotel.value = s.namaPenginapan || "";

    setAngkaRibuan("spjBiayaAkomodasi", s.biayaAkomodasi || 0);
    setAngkaRibuan("spjTidakMenginap", s.tidakMenginap || 0);
    setAngkaRibuan("spjBiayaTiketBerangkat", s.biayaTiketBerangkat || 0);
    setAngkaRibuan("spjBiayaTiketKembali", s.biayaTiketKembali || 0);
    setAngkaRibuan("spjBantuanTransport", s.bantuanTransport || 0);
    setAngkaRibuan("spjBiayaTaxiBerangkat", s.biayaTaxiBerangkat || 0);
    setAngkaRibuan("spjBiayaTaxiPulang", s.biayaTaxiPulang || 0);
    setAngkaRibuan("spjBiayaTravel", s.biayaTravel || 0);
    setAngkaRibuan("spjBiayaLain", s.biayaLain || 0);

    document.getElementById("spjNoBukti1").value = s.noBukti1 || "-";
    document.getElementById("spjTglBukti1").value = s.tglBukti1 || "-";
    document.getElementById("spjNoTiket1").value = s.noTiket1 || "-";
    document.getElementById("spjMaskapai1").value = s.maskapai1 || "-";
    document.getElementById("spjAsal1").value = s.asal1 || "-";
    document.getElementById("spjTujuan1").value = s.tujuan1 || "-";
    document.getElementById("spjTglBerangkatTiket1").value = s.tglBerangkatTiket1 || "-";
    document.getElementById("spjTglPulangTiket1").value = s.tglPulangTiket1 || "-";

    document.getElementById("spjNoBukti2").value = s.noBukti2 || "-";
    document.getElementById("spjTglBukti2").value = s.tglBukti2 || "-";
    document.getElementById("spjNoTiket2").value = s.noTiket2 || "-";
    document.getElementById("spjMaskapai2").value = s.maskapai2 || "-";
    document.getElementById("spjAsal2").value = s.asal2 || "-";
    document.getElementById("spjTujuan2").value = s.tujuan2 || "-";
    document.getElementById("spjTglKembaliTiket2").value = s.tglKembaliTiket2 || "-";

    hitungMekanikSpj();
    showToast("Data SPJ atas nama " + item.nama + " siap diisi/diedit!", "success");
  }

  function hitungMekanikSpj() {
    var infoWaktu = document.getElementById("spjInfoWaktu").innerText;
    var lama = 1;
    var matchLama = infoWaktu.match(/\((\d+)\s*Hari\)/i);
    if (matchLama && matchLama[1]) {
      lama = parseInt(matchLama[1], 10) || 1;
    }

    var uangHarian = ambilAngkaMurni("spjUangPerHari");
    var totalHarian = lama * uangHarian;
    setAngkaRibuan("spjTotalUangHarian", totalHarian);

    var totalAll = totalHarian + 
                   ambilAngkaMurni("spjUangRepresentasi") + 
                   ambilAngkaMurni("spjBiayaAkomodasi") + 
                   ambilAngkaMurni("spjTidakMenginap") + 
                   ambilAngkaMurni("spjBiayaTiketBerangkat") + 
                   ambilAngkaMurni("spjBiayaTiketKembali") + 
                   ambilAngkaMurni("spjBantuanTransport") + 
                   ambilAngkaMurni("spjBiayaTaxiBerangkat") + 
                   ambilAngkaMurni("spjBiayaTaxiPulang") + 
                   ambilAngkaMurni("spjBiayaTravel") + 
                   ambilAngkaMurni("spjBiayaLain");

    setAngkaRibuan("spjTotalBiayaAll", totalAll);
    setAngkaRibuan("spjJumlahBayar", totalAll);
  }

  function aksiSimpanSpjSusulan() {
    var id = document.getElementById("spjNoId").value;
    var elNama = document.getElementById("spjNamaPegawai");
    var nama = elNama ? elNama.value : "";
    if (!id || !nama) { 
      alert("Peringatan: Anda belum memilih pegawai yang akan disimpan SPJ-nya!"); 
      return; 
    }
    
    var dataKirim = {
      noId: id,
      namaPegawai: nama,
      uangPerHari: ambilAngkaMurni("spjUangPerHari"),
      uangRepresentasi: ambilAngkaMurni("spjUangRepresentasi"),
      namaPenginapan: document.getElementById("spjNamaPenginapan").value,
      biayaAkomodasi: ambilAngkaMurni("spjBiayaAkomodasi"),
      tidakMenginap: ambilAngkaMurni("spjTidakMenginap"),
      biayaTiketBerangkat: ambilAngkaMurni("spjBiayaTiketBerangkat"),
      biayaTiketKembali: ambilAngkaMurni("spjBiayaTiketKembali"),
      bantuanTransport: ambilAngkaMurni("spjBantuanTransport"),
      biayaTaxiBerangkat: ambilAngkaMurni("spjBiayaTaxiBerangkat"),
      biayaTaxiPulang: ambilAngkaMurni("spjBiayaTaxiPulang"),
      biayaTravel: ambilAngkaMurni("spjBiayaTravel"),
      biayaLain: ambilAngkaMurni("spjBiayaLain"),
      noBukti1: document.getElementById("spjNoBukti1").value,
      tglBukti1: document.getElementById("spjTglBukti1").value,
      noTiket1: document.getElementById("spjNoTiket1").value,
      maskapai1: document.getElementById("spjMaskapai1").value,
      asal1: document.getElementById("spjAsal1").value,
      tujuan1: document.getElementById("spjTujuan1").value,
      tglBerangkatTiket1: document.getElementById("spjTglBerangkatTiket1").value,
      tglPulangTiket1: document.getElementById("spjTglPulangTiket1").value,
      noBukti2: document.getElementById("spjNoBukti2").value,
      tglBukti2: document.getElementById("spjTglBukti2").value,
      noTiket2: document.getElementById("spjNoTiket2").value,
      maskapai2: document.getElementById("spjMaskapai2").value,
      asal2: document.getElementById("spjAsal2").value,
      tujuan2: document.getElementById("spjTujuan2").value,
      tglKembaliTiket2: document.getElementById("spjTglKembaliTiket2").value
    };

    setBtnLoading("btn-simpan-spj", true, "Menyimpan data SPJ...");

    google.script.run
      .withSuccessHandler(function(res) { 
        setBtnLoading("btn-simpan-spj", false);
        alert(res.pesan);
      })
      .withFailureHandler(function(err) {
        setBtnLoading("btn-simpan-spj", false);
        alert("Gagal simpan SPJ: " + err.message);
      })
      .updateSpjSusulan(dataKirim);
  }

  /* ================= MANAJEMEN BULAN BERJALAN & REKAP ================= */
  function getRentangBulanBerjalan() {
    var now = new Date();
    var y = now.getFullYear();
    var m = now.getMonth();
    var firstDay = new Date(y, m, 1);
    var lastDay = new Date(y, m + 1, 0);

    function toYmd(d) {
      var thn = d.getFullYear();
      var bln = ("0" + (d.getMonth() + 1)).slice(-2);
      var tgl = ("0" + d.getDate()).slice(-2);
      return thn + "-" + bln + "-" + tgl;
    }

    var namaBulan = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

    return {
      tglMulai: toYmd(firstDay),
      tglSelesai: toYmd(lastDay),
      labelBulan: namaBulan[m] + " " + y
    };
  }

  // 1. Muat otomatis data bulan berjalan saat buka tab rekap
  function muatRekapBulanBerjalan() {
    var rentang = getRentangBulanBerjalan();
    var elStatus = document.getElementById("rekapFilterStatus");
    var status = elStatus ? elStatus.value : "Belum SPJ";
    
    var badge = document.getElementById("badge-periode-rekap");
    if (badge) badge.innerText = "Bulan Berjalan (" + rentang.labelBulan + ")";

    jalankanTarikDataRekap(rentang.tglMulai, rentang.tglSelesai, status);
  }

  // 2. Otomatis reload pas user ganti dropdown Status SPJ
  function aksiGantiStatusBulanBerjalan() {
    var rentang = getRentangBulanBerjalan();
    var elStatus = document.getElementById("rekapFilterStatus");
    var status = elStatus ? elStatus.value : "Belum SPJ";

    jalankanTarikDataRekap(rentang.tglMulai, rentang.tglSelesai, status);
  }

  // 3. Mesin penampil data tabel
  function jalankanTarikDataRekap(tglMulai, tglSelesai, status) {
    var tbody = document.getElementById("tabel-rekap-body");
    tbody.innerHTML = '<tr><td colspan="7" class="text-center text-blue-400 p-6 font-medium">Sedang memproses validasi data...</td></tr>';

    var bidang = (bidangTerlogin === "Admin") ? "Semua" : bidangTerlogin;

    google.script.run
      .withSuccessHandler(function(dataList) {
        if(!dataList || dataList.length === 0) {
          tbody.innerHTML = '<tr><td colspan="7" class="text-center text-rose-400 p-6 font-medium">Tidak ada riwayat perjalanan dinas yang cocok dengan parameter.</td></tr>';
          return;
        }
        
        var htmlText = "";
        for(var i=0; i<dataList.length; i++) {
          var tombolAksiHtml = "";
          if (bidangTerlogin !== "Admin") {
            tombolAksiHtml = 
              '<div class="flex gap-1.5 justify-center">' +
                '<button type="button" class="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1" onclick="bukaModalEdit(\'' + dataList[i].noId + '\')"><i data-lucide="edit-3" class="w-3 h-3"></i><span>Edit</span></button>' +
                '<button type="button" class="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1" onclick="jalanCetakUlang(\'' + dataList[i].noId + '\', \'surat_tugas\')"><i data-lucide="printer" class="w-3 h-3"></i><span>ST</span></button>' +
                '<button type="button" class="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1" onclick="jalanCetakUlang(\'' + dataList[i].noId + '\', \'sppd\')"><i data-lucide="file-check-2" class="w-3 h-3"></i><span>SPPD</span></button>' +
              '</div>';
          } else {
            tombolAksiHtml = '<span class="text-slate-500 text-xs italic font-medium flex items-center justify-center gap-1"><i data-lucide="eye" class="w-3 h-3"></i> Hanya Pantau</span>';
          }

          var statusSpjBadge = "";
          if (dataList[i].statusSpj === "SPJ Rampung") {
            // SPJ RAMPUNG: BISA DIKLIK (Jalur Cepat Koreksi / Edit)
            statusSpjBadge = 
              '<button type="button" onclick="bukaSpjDariRekap(\'' + dataList[i].noId + '\', \'' + dataList[i].nama.replace(/'/g, "\\'") + '\')" class="px-2.5 py-1 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700 hover:border-emerald-500 text-emerald-300 rounded-md text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 mx-auto shadow-sm group" title="Klik untuk cek / koreksi SPJ">' +
                '<i data-lucide="check-circle-2" class="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform"></i>' +
                '<span>SPJ Rampung</span>' +
              '</button>';
          } else {
            // BELUM SPJ: MURNI LABEL INFO (Nggak bisa diklik, kursor panah biasa)
            statusSpjBadge = 
              '<span class="px-2.5 py-1 bg-slate-900/90 border border-slate-800 text-slate-400 rounded-md text-xs font-medium inline-flex items-center gap-1.5 cursor-default select-none">' +
                '<i data-lucide="clock" class="w-3 h-3 text-amber-400/80"></i>' +
                '<span>Belum SPJ</span>' +
              '</span>';
          }

          htmlText += "<tr class='hover:bg-slate-900/50 transition-colors'>" +
            "<td class='p-3.5 font-bold text-slate-200 font-mono'>" + dataList[i].noId + "</td>" +
            "<td class='p-3.5 text-slate-300 font-medium'>" + dataList[i].nama + "</td>" +
            "<td class='p-3.5 text-slate-300'>" + dataList[i].tujuan + "</td>" +
            "<td class='p-3.5 text-slate-400'>" + dataList[i].tglDinas + "</td>" +
            "<td class='p-3.5 text-slate-400'>" + dataList[i].lama + "</td>" +
            "<td class='p-3.5 text-center'>" + statusSpjBadge + "</td>" +
            "<td class='p-3.5 text-center'>" + tombolAksiHtml + "</td>" +
            "</tr>";
        }
        tbody.innerHTML = htmlText;
        refreshIcons();
      })
      .withFailureHandler(function(err) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-rose-400 p-6 font-medium">Gagal memuat data rekap: ' + err.message + '</td></tr>';
      })
      .ambilDataRekap(tglMulai, tglSelesai, bidang, status);
  }

  function bukaSpjDariRekap(noId, namaTarget) {
    var tabBtnSpj = document.getElementById("tabBtn-spj");
    bukaTab({ currentTarget: tabBtnSpj }, 'menu-spj');
    
    document.getElementById("cariNoIdSpj").value = noId;
    
    google.script.run
      .withSuccessHandler(function(res) {
        if (!res || res.status !== "ditemukan") return;
        cacheRombonganSpj = res.list || [];
        
        var target = cacheRombonganSpj.find(function(p) {
          return p.nama.toLowerCase().trim() === String(namaTarget).toLowerCase().trim();
        });

        if (target) {
          muatDataSpjPegawaiTerpilih(target);
        } else if (cacheRombonganSpj.length > 0) {
          muatDataSpjPegawaiTerpilih(cacheRombonganSpj[0]);
        }
      })
      .cariSppdForSpj(noId);
  }

  function jalanCetakDirektif(jenis) {
    var id = "";
    var namaPeg = "";

    if (jenis === 'spj') {
      id = document.getElementById("spjNoId").value || document.getElementById("cariNoIdSpj").value.trim().toUpperCase();
      var elNama = document.getElementById("spjNamaPegawai");
      namaPeg = elNama ? elNama.value : "";
    } else {
      id = idBerkasAktif || document.getElementById("noId").value;
    }

    if (!id) {
      alert("Peringatan: Tentukan No ID Berkas target terlebih dahulu untuk mencetak!");
      return;
    }
    
    google.script.run.withSuccessHandler(function(url) {
      var linkAkses = url + "?id=" + encodeURIComponent(id) + "&type=" + encodeURIComponent(jenis) + (namaPeg ? "&nama=" + encodeURIComponent(namaPeg) : "");
      window.open(linkAkses, '_blank');
    }).getScriptUrl();
  }

  /* ================= MODAL 1: CARI REKAP RIWAYAT / ARSIP ================= */
  function bukaModalCariRekap() {
    var rentang = getRentangBulanBerjalan();
    document.getElementById("modalCariTglMulai").value = rentang.tglMulai;
    document.getElementById("modalCariTglSelesai").value = rentang.tglSelesai;
    document.getElementById("modalFilterCariRekap").classList.remove("hidden");
    refreshIcons();
  }

  function tutupModalCariRekap() {
    document.getElementById("modalFilterCariRekap").classList.add("hidden");
  }

  function eksekusiCariRekapModal() {
    var tglMulai = document.getElementById("modalCariTglMulai").value;
    var tglSelesai = document.getElementById("modalCariTglSelesai").value;
    var status = document.getElementById("modalCariStatusSpj").value;

    tutupModalCariRekap();

    var badge = document.getElementById("badge-periode-rekap");
    if (badge) {
      if (tglMulai && tglSelesai) {
        badge.innerText = "Arsip: " + formatKeTglPendek(tglMulai) + " s/d " + formatKeTglPendek(tglSelesai);
      } else {
        badge.innerText = "Arsip: Semua Periode";
      }
    }

    // Samakan nilai dropdown status di header tabel
    var elStatus = document.getElementById("rekapFilterStatus");
    if (elStatus) elStatus.value = status;

    jalankanTarikDataRekap(tglMulai, tglSelesai, status);
  }

  /* ================= MODAL 2: EKSPOR EXCEL SESUAI PERIODE ================= */
  function bukaModalEksporExcel() {
    var rentang = getRentangBulanBerjalan();
    document.getElementById("modalEksporTglMulai").value = rentang.tglMulai;
    document.getElementById("modalEksporTglSelesai").value = rentang.tglSelesai;
    document.getElementById("modalEksporPeriodeExcel").classList.remove("hidden");
    refreshIcons();
  }

  function tutupModalEksporExcel() {
    document.getElementById("modalEksporPeriodeExcel").classList.add("hidden");
  }

  function setPeriodeCepatEkspor(tipe) {
    if (tipe === 'bulan_ini') {
      var rentang = getRentangBulanBerjalan();
      document.getElementById("modalEksporTglMulai").value = rentang.tglMulai;
      document.getElementById("modalEksporTglSelesai").value = rentang.tglSelesai;
    } else {
      document.getElementById("modalEksporTglMulai").value = "";
      document.getElementById("modalEksporTglSelesai").value = "";
    }
  }

  function eksekusiEksporExcelModal() {
    var tglMulai = document.getElementById("modalEksporTglMulai").value;
    var tglSelesai = document.getElementById("modalEksporTglSelesai").value;
    var status = document.getElementById("modalEksporStatusSpj").value;
    var bidang = (bidangTerlogin === "Admin") ? "Semua" : bidangTerlogin;

    if (typeof XLSX === "undefined") {
      alert("Peringatan: Modul Excel sedang dimuat, silakan coba 3 detik lagi.");
      return;
    }

    setBtnLoading("btn-eksekusi-ekspor", true, "Menyiapkan Excel...");

    google.script.run
      .withSuccessHandler(function(res) {
        setBtnLoading("btn-eksekusi-ekspor", false);
        tutupModalEksporExcel();

        if (!res || res.status !== "sukses") {
          alert(res ? res.pesan : "Gagal menyiapkan data ekspor.");
          return;
        }

        if (!res.rows || res.rows.length === 0) {
          alert("Pemberitahuan: Tidak ada data perjalanan dinas yang cocok untuk diekspor pada parameter ini.");
          return;
        }

        try {
          var aoaData = [res.header].concat(res.rows);
          var ws = XLSX.utils.aoa_to_sheet(aoaData);
          var wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, "rekap_sppd");

          var labelBidang = (bidang || "BPKPD").replace(/[^a-zA-Z0-9]/g, "_");
          var labelPeriode = (tglMulai && tglSelesai) ? ("_" + tglMulai + "_sd_" + tglSelesai) : "_Semua_Periode";
          var namaFile = "Rekap_SPPD_" + labelBidang + labelPeriode + ".xlsx";

          XLSX.writeFile(wb, namaFile);
          showToast("Berhasil mengekspor " + res.totalBaris + " baris ke file " + namaFile, "success");
        } catch(err) {
          console.error("XLSX Export Error:", err);
          alert("Gagal memproses file Excel: " + err.message);
        }
      })
      .withFailureHandler(function(err) {
        setBtnLoading("btn-eksekusi-ekspor", false);
        alert("Gagal koneksi ekspor ke server: " + err.message);
      })
      .ambilDataEksporExcel(tglMulai, tglSelesai, bidang, status);
  }

  /* ================= MODAL PILIH FORMAT CETAK SPPD & SURAT TUGAS ================= */
  var idTargetCetakSppd = "";
  var idTargetCetakSpt = "";

  // 1. POP-UP CETAK SPPD
  function bukaModalPilihCetakSppd(noId) {
    idTargetCetakSppd = noId;
    var modal = document.getElementById("modalPilihCetakSppd");
    if (modal) {
      modal.classList.remove("hidden");
      refreshIcons();
    }
  }

  function tutupModalPilihCetakSppd() {
    var modal = document.getElementById("modalPilihCetakSppd");
    if (modal) modal.classList.add("hidden");
    idTargetCetakSppd = "";
  }

  function eksekusiCetakSppdPilihan(modePengikut) {
    if (!idTargetCetakSppd) return;
    var targetId = idTargetCetakSppd;
    tutupModalPilihCetakSppd();

    google.script.run.withSuccessHandler(function(url) {
      var linkAkses = url + "?id=" + encodeURIComponent(targetId) + "&type=sppd&pengikut_mode=" + modePengikut;
      window.open(linkAkses, '_blank');
    }).getScriptUrl();
  }

  // 2. POP-UP CETAK SURAT TUGAS (DINAMIS DARI DATABASE PEJABAT)
  function bukaModalPilihTtdSpt(noId) {
    idTargetCetakSpt = noId;
    var modal = document.getElementById("modalPilihTtdSpt");
    if (!modal) return;

    var lblKabid = document.getElementById("lbl-ttd-kabid");
    var lblSekda = document.getElementById("lbl-ttd-sekretaris");
    var lblKaban = document.getElementById("lbl-ttd-kaban");

    if (lblKabid) lblKabid.innerText = "Pejabat: Memuat data...";
    if (lblSekda) lblSekda.innerText = "Pejabat: Memuat data...";
    if (lblKaban) lblKaban.innerText = "Pejabat: Memuat data...";

    // Tarik nama aktif pejabat secara dinamis dari setting
    google.script.run.withSuccessHandler(function(list) {
      var targetBidang = (bidangTerlogin || "Akuntansi").trim().toLowerCase();
      var namaKabid = "Kepala Bidang " + (bidangTerlogin || "Akuntansi");
      var namaSekda = "KARSONO, SIP, MM";
      var namaKaban = "YAYUK BASUKI, SE";

      if (list && list.length > 0) {
        list.forEach(function(item) {
          var pRole = String(item.peran || "").toLowerCase();
          var pBid = String(item.bidang || "").toLowerCase();

          if (pRole.indexOf("kepala badan") > -1) {
            namaKaban = item.nama;
          } else if (pRole.indexOf("sekretaris") > -1) {
            namaSekda = item.nama;
          } else if (pRole.indexOf("kepala bidang") > -1 && (pBid === targetBidang || pBid === "semua")) {
            namaKabid = item.nama;
          }
        });
      }

      if (lblKabid) lblKabid.innerText = "Pejabat: " + namaKabid;
      if (lblSekda) lblSekda.innerText = "Pejabat: " + namaSekda;
      if (lblKaban) lblKaban.innerText = "Pejabat: " + namaKaban;
    }).ambilSemuaPejabatAktif();

    modal.classList.remove("hidden");
    refreshIcons();
  }

  function tutupModalPilihTtdSpt() {
    var modal = document.getElementById("modalPilihTtdSpt");
    if (modal) modal.classList.add("hidden");
    idTargetCetakSpt = "";
  }

  function eksekusiCetakSptPilihan(peranTtd) {
    if (!idTargetCetakSpt) return;
    var targetId = idTargetCetakSpt;
    tutupModalPilihTtdSpt();

    // Catat pilihan pejabat ke Kolom AT (46) Spreadsheet di balik layar
    google.script.run.simpanPenandatanganSpt(targetId, peranTtd);

    // Langsung buka dokumen cetak Surat Tugas resmi
    google.script.run.withSuccessHandler(function(url) {
      var linkAkses = url + "?id=" + encodeURIComponent(targetId) + "&type=surat_tugas&ttd_mode=" + encodeURIComponent(peranTtd);
      window.open(linkAkses, '_blank');
    }).getScriptUrl();
  }

  // 3. JALUR CETAK ULANG DARI TABEL REKAP
  function jalanCetakUlang(noId, jenis) {
    if (!noId) {
      alert("Peringatan: ID Berkas tidak valid!");
      return;
    }
    
    // Jika cetak SPPD -> Buka pop-up pilihan model pengikut/perorangan
    if (jenis === 'sppd') {
      bukaModalPilihCetakSppd(noId);
      return;
    }

    // Jika cetak Surat Tugas -> Buka pop-up pilihan penandatangan dinamis
    if (jenis === 'surat_tugas') {
      bukaModalPilihTtdSpt(noId);
      return;
    }

    google.script.run.withSuccessHandler(function(url) {
      var linkAkses = url + "?id=" + encodeURIComponent(noId) + "&type=" + encodeURIComponent(jenis);
      window.open(linkAkses, '_blank');
    }).getScriptUrl();
  }

  /* ================= MODAL EDIT REVISI LENGKAP ================= */
  function hitungHariEdit() {
    var tgl1 = document.getElementById("editTglBerangkat").value;
    var tgl2 = document.getElementById("editTglKembali").value;
    if (tgl1 && tgl2) {
      var hari = ((new Date(tgl2).getTime() - new Date(tgl1).getTime()) / (1000 * 3600 * 24)) + 1;
      if (hari > 0) {
        document.getElementById("editLamaHari").value = hari + " Hari";
      } else {
        alert("Kekeliruan: Tanggal kembali mendahului tanggal berangkat!");
        document.getElementById("editTglKembali").value = "";
        document.getElementById("editLamaHari").value = "";
      }
    }
  }

  function bukaModalEdit(noId) {
    document.getElementById("editNoId").value = noId;
    var container = document.getElementById("container-edit-pegawai");
    container.innerHTML = '<div class="text-center text-blue-400 py-3 font-medium">Memuat data lengkap berkas...</div>';
    
    document.getElementById("modalEdit").classList.remove("hidden");
    refreshIcons();

    google.script.run.withSuccessHandler(function(res) {
      if (res.status === "sukses") {
        document.getElementById("editNoSpt").value = res.noSpt || "-";
        document.getElementById("editTglSurat").value = res.tglSurat || "";
        document.getElementById("editTglBerangkat").value = res.tglBerangkat || "";
        document.getElementById("editTglKembali").value = res.tglKembali || "";
        document.getElementById("editLamaHari").value = (res.lamaHari || "1") + " Hari";
        document.getElementById("editTujuan").value = res.tujuan || "";
        document.getElementById("editModaTransportasi").value = res.modaTransportasi || "Kendaraan Dinas";
        document.getElementById("editDasar").value = res.dasarSuratTugas || "";
        document.getElementById("editKeperluan").value = res.keperluan || "";

        var selectEditAnggaran = document.getElementById("editMataAnggaran");
        selectEditAnggaran.innerHTML = "";
        var optCurrent = document.createElement("option");
        optCurrent.value = res.mataAnggaran;
        optCurrent.innerText = res.mataAnggaran || "-- Belum Ditentukan --";
        optCurrent.selected = true;
        selectEditAnggaran.appendChild(optCurrent);

        google.script.run.withSuccessHandler(function(listAnggaran) {
          if (listAnggaran && listAnggaran.length > 0) {
            listAnggaran.forEach(function(item) {
              if (item.kode !== res.mataAnggaran) {
                var opt = document.createElement("option");
                opt.value = item.kode;
                var teksFull = item.kode + " - " + item.uraian;
                opt.title = teksFull;
                opt.innerText = (teksFull.length > 82) ? (teksFull.substring(0, 80) + "...") : teksFull;
                selectEditAnggaran.appendChild(opt);
              }
            });
          }
        }).ambilAnggaranPerBidang(bidangTerlogin || res.bidang);

        container.innerHTML = "";
        res.daftarPegawai.forEach(function(nama) {
          tambahBarisEditPegawai(nama);
        });
        refreshIcons();
      } else {
        alert("Gagal memuat data: " + res.pesan);
        tutupModalEdit();
      }
    }).ambilDataDetailEdit(noId);
  }

  function tutupModalEdit() {
    document.getElementById("modalEdit").classList.add("hidden");
  }

  function tambahBarisEditPegawai(namaValue) {
    var container = document.getElementById("container-edit-pegawai");
    var div = document.createElement("div");
    div.className = "flex gap-2 items-center row-edit-pegawai mb-2";

    var optionsHtml = '<option value="">-- Pilih Nama Pegawai --</option>';
    if (window.cachedDaftarPegawai && window.cachedDaftarPegawai.length > 0) {
      window.cachedDaftarPegawai.forEach(function(nama) {
        var selected = (nama === namaValue) ? "selected" : "";
        optionsHtml += '<option value="' + nama + '" ' + selected + '>' + nama + '</option>';
      });
    }

    div.innerHTML = `
      <div class="flex-1">
        <select class="edit-nama-pegawai w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white" required>` + optionsHtml + `</select>
      </div>
      <div>
        <button type="button" class="p-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold cursor-pointer flex items-center justify-center" onclick="hapusBarisEditPegawai(this)" title="Hapus Pegawai">
          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
        </button>
      </div>
    `;
    container.appendChild(div);
    refreshIcons();
  }

  function hapusBarisEditPegawai(btn) {
    var container = document.getElementById("container-edit-pegawai");
    if (container.getElementsByClassName("row-edit-pegawai").length <= 1) {
      alert("Peringatan: Minimal harus ada 1 pegawai dalam rombongan!");
      return;
    }
    btn.closest(".row-edit-pegawai").remove();
  }

  function aksiSimpanRevisi() {
    var form = document.getElementById("formEditSppd");
    if (!form.checkValidity()) {
      alert("Peringatan: Lengkapi seluruh isian revisi wajib!");
      return;
    }

    var listPegawaiBaru = [];
    document.querySelectorAll(".edit-nama-pegawai").forEach(function(sel) {
      if (sel.value) listPegawaiBaru.push(sel.value);
    });

    if (listPegawaiBaru.length === 0) {
      alert("Peringatan: Minimal harus ada 1 pegawai dalam rombongan!");
      return;
    }

    var dataRevisi = {
      noId: document.getElementById("editNoId").value,
      tglSurat: document.getElementById("editTglSurat").value,
      tglBerangkat: document.getElementById("editTglBerangkat").value,
      tglKembali: document.getElementById("editTglKembali").value,
      tujuan: document.getElementById("editTujuan").value,
      modaTransportasi: document.getElementById("editModaTransportasi").value,
      mataAnggaran: document.getElementById("editMataAnggaran").value,
      dasarSuratTugas: document.getElementById("editDasar").value,
      keperluan: document.getElementById("editKeperluan").value,
      listPegawai: listPegawaiBaru
    };

    setBtnLoading("btn-simpan-revisi", true, "Menyimpan revisi...");

    google.script.run
      .withSuccessHandler(function(res) {
        setBtnLoading("btn-simpan-revisi", false);
        alert(res.pesan);
        if (res.status === "sukses") {
          tutupModalEdit();
          muatRekapBulanBerjalan();
        }
      })
      .withFailureHandler(function(err) {
        setBtnLoading("btn-simpan-revisi", false);
        alert("Error: " + err.message);
      })
      .simpanDataRevisi(dataRevisi);
  }

  /* ================= MANAJEMEN SETTING KHUSUS PEJABAT BIDANG ================= */
  function muatSettingPejabatBidang() {
    var labelBidang = document.getElementById("label-bidang-setting");
    var inputBidangLock = document.getElementById("bidang-pejabat-bidang-lock");
    var selectPegawai = document.getElementById("bidang-pejabat-pilih");

    if (labelBidang) labelBidang.innerText = bidangTerlogin ? bidangTerlogin.toUpperCase() : "BIDANG";
    if (inputBidangLock) inputBidangLock.value = bidangTerlogin || "-";

    // 1. Muat dropdown seluruh pegawai kantor
    if (selectPegawai) {
      selectPegawai.innerHTML = '<option value="">-- Memuat Daftar Pegawai... --</option>';
      google.script.run.withSuccessHandler(function(list) {
        listPegawaiLengkap = list || [];
        selectPegawai.innerHTML = '<option value="">-- Pilih Pegawai dari Database --</option>';
        listPegawaiLengkap.forEach(function(p) {
          var opt = document.createElement("option");
          opt.value = p.nip;
          opt.textContent = p.nama;
          selectPegawai.appendChild(opt);
        });
      }).ambilSemuaPegawaiLengkap();
    }

    // 2. Muat daftar pejabat aktif khusus bidang ini
    muatDaftarPejabatAktifBidang();
  }

  function pilihPegawaiUntukPejabatBidang() {
    var nip = document.getElementById("bidang-pejabat-pilih").value;
    var target = listPegawaiLengkap.find(function(p) { return String(p.nip).trim() === String(nip).trim(); });
    if (target) {
      document.getElementById("bidang-pejabat-nip").value = target.nip;
      document.getElementById("bidang-pejabat-nama").value = target.nama;
    } else {
      document.getElementById("bidang-pejabat-nip").value = "";
      document.getElementById("bidang-pejabat-nama").value = "";
    }
  }

  function muatDaftarPejabatAktifBidang() {
    var container = document.getElementById("container-list-pejabat-bidang");
    if (!container) return;
    container.innerHTML = '<span class="text-slate-500 italic">Memuat pejabat bidang...</span>';

    google.script.run.withSuccessHandler(function(list) {
      if (!list || list.length === 0) {
        container.innerHTML = '<span class="text-slate-500 italic">Belum ada pejabat terdaftar.</span>';
        return;
      }

      var targetBidang = (bidangTerlogin || "").trim().toLowerCase();
      var listBidangIni = list.filter(function(item) {
        return String(item.bidang || "").trim().toLowerCase() === targetBidang;
      });

      if (listBidangIni.length === 0) {
        container.innerHTML = '<span class="text-amber-400/80 italic">Belum ada KPA/PPTK/BPP yang terdaftar untuk ' + (bidangTerlogin || '') + '. Silakan tetapkan di form atas.</span>';
        return;
      }

      var html = "";
      listBidangIni.forEach(function(item) {
        html += '<div class="flex items-center justify-between py-2 border-b border-slate-800/80 last:border-0">' +
                  '<div>' +
                    '<div class="text-emerald-400 font-bold text-xs">' + item.peran + '</div>' +
                    '<div class="text-white font-medium text-xs mt-0.5">' + item.nama + ' <span class="text-slate-400 font-mono text-[11px]">(NIP. ' + item.nip + ')</span></div>' +
                  '</div>' +
                  '<div class="flex items-center gap-2">' +
                    '<span class="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">Aktif</span>' +
                    '<button type="button" onclick="aksiHapusPejabatBidang(\'' + item.nip + '\', \'' + item.peran + '\')" class="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer" title="Hapus Pejabat">' +
                      '<i data-lucide="trash-2" class="w-3.5 h-3.5"></i>' +
                    '</button>' +
                  '</div>' +
                '</div>';
      });
      container.innerHTML = html;
      refreshIcons();
    }).ambilSemuaPejabatAktif();
  }

  function aksiHapusPejabatBidang(nip, peran) {
    if (!confirm("Apakah Anda yakin ingin menghapus " + peran + " ini dari database pejabat unit kerja?")) {
      return;
    }

    google.script.run.withSuccessHandler(function(res) {
      alert(res.pesan);
      if (res.status === "sukses") {
        muatDaftarPejabatAktifBidang();
      }
    }).hapusPejabat(nip, peran, bidangTerlogin);
  }

  function simpanSettingPejabatBidang() {
    var nip = document.getElementById("bidang-pejabat-nip").value;
    var nama = document.getElementById("bidang-pejabat-nama").value;
    var peran = document.getElementById("bidang-pejabat-peran").value;
    var bidang = bidangTerlogin;

    if (!nip || !nama) {
      alert("Peringatan: Harap pilih pegawai dari daftar terlebih dahulu!");
      return;
    }

    var dataKirim = { nip: nip, nama: nama, peran: peran, bidang: bidang };
    setBtnLoading("btn-simpan-pejabat-bidang", true, "Menyimpan ke database...");

    google.script.run
      .withSuccessHandler(function(res) {
        setBtnLoading("btn-simpan-pejabat-bidang", false);
        alert(res.pesan);
        if (res.status === "sukses") {
          muatDaftarPejabatAktifBidang();
        }
      })
      .withFailureHandler(function(err) {
        setBtnLoading("btn-simpan-pejabat-bidang", false);
        alert("Gagal: " + err.message);
      })
      .simpanPejabatBaru(dataKirim);
  }

  /* ================= FUNGSI LOGOUT ================= */
  function aksiLogoutSistem() {
    var modal = document.getElementById("modalLogout");
    if (modal) {
      modal.classList.remove("hidden");
      refreshIcons();
    } else {
      eksekusiLogoutSistem();
    }
  }

  function tutupModalLogout() {
    var modal = document.getElementById("modalLogout");
    if (modal) modal.classList.add("hidden");
  }

  function eksekusiLogoutSistem() {
    tutupModalLogout();
    bidangTerlogin = ""; 
    idBerkasAktif = "";
    document.getElementById("formSuratTugas").reset();
    document.getElementById("formSpjSusulan").reset();
    document.getElementById("cariNoIdSpj").value = "";
    document.getElementById("user-aktif").innerText = "-";
    document.getElementById("main-application").classList.add("hidden");
    document.getElementById("login-box").classList.remove("hidden");
    document.getElementById("login-pass").value = "";
    document.getElementById("login-bidang").value = "";
    document.getElementById("login-error").classList.add("hidden");

    var optAdmin = document.querySelector('#login-bidang option[value="Admin"]');
    if (optAdmin) optAdmin.remove();
    
    var tabBtnSettings = document.getElementById("tabBtn-settings");
    if (tabBtnSettings) tabBtnSettings.style.display = "none";
    
    var tabcontent = document.getElementsByClassName("tab-content");
    for (var i = 0; i < tabcontent.length; i++) {
      tabcontent[i].classList.add("hidden");
      tabcontent[i].classList.remove("active");
    }
    document.getElementById("menu-sppd").classList.remove("hidden");
    document.getElementById("menu-sppd").classList.add("active");
    
    var firstTabBtn = document.querySelector(".tab-link");
    var tablinks = document.getElementsByClassName("tab-link");
    for (var i = 0; i < tablinks.length; i++) {
      tablinks[i].classList.remove("bg-slate-800", "shadow-sm", "text-white", "font-bold");
      tablinks[i].classList.add("text-slate-400");
    }
    if (firstTabBtn) {
      firstTabBtn.classList.add("bg-slate-800", "shadow-sm", "text-white", "font-bold");
      firstTabBtn.classList.remove("text-slate-400");
    }

    refreshIcons();
    showToast("Anda telah berhasil keluar dari sistem.", "info");
  }

  function intipPassword() {
    var passInput = document.getElementById("login-pass");
    var toggleBox = document.getElementById("toggle-mata");
    if (passInput.type === "password") { 
      passInput.type = "text"; 
      toggleBox.innerHTML = '<i data-lucide="eye-off" class="w-4 h-4 text-sky-400"></i>';
    } else { 
      passInput.type = "password"; 
      toggleBox.innerHTML = '<i data-lucide="eye" class="w-4 h-4"></i>';
    }
    refreshIcons();
  }

  function deteksiEnterLogin(event) {
    if (event.keyCode === 13 || event.key === "Enter") { event.preventDefault(); aksiLogin(); }
  }

  function muatDropdownOtomatis() {
    var selectAnggaran = document.getElementById("mataAnggaran");
    var selectKecamatan = document.getElementById("daerahKecamatan");

    google.script.run.withSuccessHandler(function(listKecamatan) {
      if(listKecamatan && listKecamatan.length > 0) {
        selectKecamatan.innerHTML = '<option value="">-- Pilih Kecamatan Tujuan --</option>';
        listKecamatan.forEach(function(kec) {
          var opt = document.createElement("option"); opt.value = kec; opt.innerText = kec; selectKecamatan.appendChild(opt);
        });
      }
    }).ambilSemuaKecamatan();

    google.script.run.withSuccessHandler(function(listAnggaran) {
      if(listAnggaran && listAnggaran.length > 0) {
        selectAnggaran.innerHTML = '<option value="">-- Pilih Kode Rekening Kegiatan --</option>';
        listAnggaran.forEach(function(item) {
          var opt = document.createElement("option"); 
          opt.value = item.kode; // VALUE TETAP ASLI 100% AMAN!
          
          var teksFull = item.kode + " - " + item.uraian;
          opt.title = teksFull; // Hover kursor mouse akan menampilkan nama lengkap!
          
          // Potong tampilan jika lebih dari 52 huruf agar pop-up tidak nabrak
          opt.innerText = (teksFull.length > 82) ? (teksFull.substring(0, 80) + "...") : teksFull;
          
          selectAnggaran.appendChild(opt);
        });
      } else { selectAnggaran.innerHTML = '<option value="">Tidak ada anggaran untuk bidang ini</option>'; }
    }).ambilAnggaranPerBidang(bidangTerlogin);

    google.script.run.withSuccessHandler(function(listPegawai) {
      if(listPegawai && listPegawai.length > 0) {
        window.cachedDaftarPegawai = listPegawai;
        updateDatalistPegawai(listPegawai);
        initPegawaiST();
      }
    }).ambilSemuaNamaPegawai();

    google.script.run.withSuccessHandler(function(listKota) {
      if(listKota && listKota.length > 0) {
        window.cachedDaftarKota = listKota;
        updateDatalistKota(listKota);
      }
    }).ambilSemuaKotaTujuan();
  }

  function updateDatalistPegawai(list) {
    var dl = document.getElementById("datalist-pegawai-st");
    if (!dl) return;
    dl.innerHTML = "";
    (list || []).forEach(function(nama) {
      var opt = document.createElement("option");
      opt.value = nama;
      dl.appendChild(opt);
    });
  }

  function updateDatalistKota(list) {
    var dl = document.getElementById("datalist-kota-tujuan");
    if (!dl) return;
    dl.innerHTML = "";
    (list || []).forEach(function(kota) {
      var opt = document.createElement("option");
      opt.value = kota;
      dl.appendChild(opt);
    });
  }

  function bukaModalTambahKota() {
    document.getElementById("inputNamaKotaBaru").value = "";
    document.getElementById("modalTambahKota").classList.remove("hidden");
    refreshIcons();
    setTimeout(function() { document.getElementById("inputNamaKotaBaru").focus(); }, 150);
  }

  function tutupModalTambahKota() {
    document.getElementById("modalTambahKota").classList.add("hidden");
  }

  function simpanKotaBaruKeDb() {
    var kota = document.getElementById("inputNamaKotaBaru").value;
    if (!kota.trim()) {
      alert("Peringatan: Masukkan nama kota terlebih dahulu!");
      return;
    }

    setBtnLoading("btn-simpan-kota", true, "Menyimpan...");

    google.script.run
      .withSuccessHandler(function(res) {
        setBtnLoading("btn-simpan-kota", false);
        alert(res.pesan);
        if (res.status === "sukses") {
          tutupModalTambahKota();
          if (!window.cachedDaftarKota) window.cachedDaftarKota = [];
          window.cachedDaftarKota.push(res.kotaBaru);
          window.cachedDaftarKota.sort();
          updateDatalistKota(window.cachedDaftarKota);
          document.getElementById("daerahTujuanLuar").value = res.kotaBaru;
        }
      })
      .withFailureHandler(function() {
        setBtnLoading("btn-simpan-kota", false);
      })
      .tambahKotaBaru(kota);
  }

  function aturTampilanWilayah(pilihan) { gantiCakupanWilayah(pilihan); }

  function gantiCakupanWilayah(pilihan) {
    var boxKec = document.getElementById('box-kecamatan');
    var boxDesa = document.getElementById('box-desa');
    var boxLuar = document.getElementById('box-luar-daerah');
    if (pilihan === "Dalam Daerah") { 
      boxKec.style.display = "block"; 
      boxDesa.style.display = "block"; 
      boxLuar.style.display = "none"; 
    } else { 
      boxKec.style.display = "none"; 
      boxDesa.style.display = "none"; 
      boxLuar.style.display = "block"; 
    }

    google.script.run.withSuccessHandler(function(idBaru) {
      document.getElementById("noId").value = idBaru;
    }).generateIdOtomatis(pilihan);
  }

  function aksiMuatDesa(namaKecamatan) {
    var selectDesa = document.getElementById("daerahDesa");
    if (!namaKecamatan) { selectDesa.innerHTML = '<option value="">-- Pilih Kecamatan Terlebih Dahulu --</option>'; return; }
    selectDesa.innerHTML = '<option value="">-- Memuat Daftar Desa... --</option>';
    
    google.script.run.withSuccessHandler(function(listDesa) {
      selectDesa.innerHTML = '<option value="">-- Pilih Desa / Kelurahan (Jika Ada) --</option>';
      if (listDesa && listDesa.length > 0) {
        listDesa.forEach(function(desa) {
          var opt = document.createElement("option"); opt.value = desa; opt.innerText = desa; selectDesa.appendChild(opt);
        });
      }
    }).ambilDesaPerKecamatan(namaKecamatan);
  }

  function muatSptTerakhirBidang() {
    var container = document.getElementById("container-spt-terakhir");
    container.innerHTML = '<span class="text-blue-400 text-sm">Mencari data Surat Tugas terbaru...</span>';

    google.script.run.withSuccessHandler(function(res) {
      if (res && res.status === "sukses") {
        window.sptTerpilihId = res.noId;
        
        container.innerHTML = `
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <b class="text-white text-sm sm:text-base">${res.labelResume}</b>
              <div class="text-xs text-slate-400 mt-0.5">Keperluan: ${res.keperluan} | Jumlah Pegawai: ${res.jumlahOrang} Orang</div>
            </div>
            <div>
              <span class="bg-blue-950 text-blue-300 border border-blue-900 px-2.5 py-1 rounded-md text-xs font-bold inline-block">ID: ${res.noId}</span>
            </div>
          </div>
        `;
      } else {
        window.sptTerpilihId = "";
        container.innerHTML = '<span class="text-rose-400 text-sm">Belum ada riwayat Surat Tugas yang tersimpan untuk bidang Anda. Silakan buat di Tab Surat Tugas.</span>';
      }
    }).ambilSptTerakhirByBidang(bidangTerlogin);
  }

  function aksiCetakSppdPilihan() {
    if (!window.sptTerpilihId) {
      alert("Peringatan: Tidak ada Surat Tugas yang tersedia untuk dicetak!");
      return;
    }

    var pakaiPengikut = document.getElementById("modePengikut").checked ? "1" : "0";
    
    google.script.run.withSuccessHandler(function(url) {
      var linkAkses = url + "?id=" + window.sptTerpilihId + "&type=sppd&pengikut_mode=" + pakaiPengikut;
      window.open(linkAkses, '_blank');
    }).getScriptUrl();
  }

  /* ================= BILLBOARD & TOOLS SETTINGS (2 MODE & SUARA ON) ================= */
  function previewBillboardSetting() {
    var mode = document.getElementById("set-billboard-mode").value;
    var boxUrl = document.getElementById("box-set-banner-url");
    if (mode === "event") {
      boxUrl.classList.remove("hidden");
    } else {
      boxUrl.classList.add("hidden");
    }
  }

  function renderBillboardLive(config) {
    var modePengumuman = document.getElementById("billboard-mode-pengumuman");
    var modeEvent = document.getElementById("billboard-mode-event");

    if (modePengumuman) modePengumuman.classList.add("hidden");
    if (modeEvent) modeEvent.classList.add("hidden");

    var modeAktif = (config && config.mode === "event") ? "event" : "pengumuman";

    if (modeAktif === "event") {
      var imgEl = document.getElementById("billboard-img-event");
      var videoEl = document.getElementById("billboard-video-event");
      var iframeEl = document.getElementById("billboard-iframe-event");
      var mediaUrl = (config.url || "").trim();
      var driveMatch = mediaUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || mediaUrl.match(/id=([a-zA-Z0-9_-]+)/);
      if (driveMatch && driveMatch[1]) {
        mediaUrl = "https://lh3.googleusercontent.com/d/" + driveMatch[1];
      }

      if (videoEl) { videoEl.pause(); videoEl.src = ""; videoEl.classList.add("hidden"); }
      if (iframeEl) { iframeEl.src = ""; iframeEl.classList.add("hidden"); }
      if (imgEl) { imgEl.classList.add("hidden"); }

      // DETEKSI YOUTUBE (AKTIFKAN SUARA DENGAN mute=0 & CONTROLS=1)
      var youtubeMatch = mediaUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([\w-]{11})/);
      var isDirectVideo = /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(mediaUrl);

      if (youtubeMatch && youtubeMatch[1]) {
        var videoId = youtubeMatch[1];
        // KUNCI SUARA: mute=0 (suara aktif), controls=1 (tombol volume terlihat)
        iframeEl.src = "https://www.youtube.com/embed/" + videoId + "?autoplay=1&mute=0&loop=1&playlist=" + videoId + "&controls=1&enablejsapi=1";
        iframeEl.classList.remove("hidden");
      } else if (isDirectVideo) {
        videoEl.muted = false; // BERSUARA
        videoEl.src = mediaUrl;
        videoEl.classList.remove("hidden");
        videoEl.play().catch(function(e) { console.log("Autoplay bersuara dicegah browser:", e); });
      } else {
        imgEl.src = mediaUrl || "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80";
        imgEl.classList.remove("hidden");
      }

      if (modeEvent) modeEvent.classList.remove("hidden");
    } else {
      // DEFAULT / MODE PENGUMUMAN
      var videoElReset = document.getElementById("billboard-video-event");
      if(videoElReset) { videoElReset.pause(); videoElReset.src = ""; }
      var iframeReset = document.getElementById("billboard-iframe-event");
      if(iframeReset) { iframeReset.src = ""; }

      document.getElementById("billboard-tag-pengumuman").innerText = config.tag || "";
      document.getElementById("billboard-judul-pengumuman").innerText = config.judul || "";
      document.getElementById("billboard-isi-pengumuman").innerText = config.isi || "";
      
      if (modePengumuman) modePengumuman.classList.remove("hidden");
    }
    refreshIcons();
  }

  function terapkanSettingBillboard() {
    var mode = document.getElementById("set-billboard-mode").value;
    var tag = document.getElementById("set-billboard-tag").value;
    var judul = document.getElementById("set-billboard-judul").value;
    var isi = document.getElementById("set-billboard-isi").value;
    var url = document.getElementById("set-billboard-url").value;

    var config = {
      mode: mode,
      tag: tag,
      judul: judul,
      isi: isi,
      url: url
    };

    try {
      localStorage.setItem("SIAP DINAS_billboard_config", JSON.stringify(config));
    } catch(e) {}

    renderBillboardLive(config);
    showToast("Pengaturan Ruang Interaktif berhasil disimpan dan diterapkan!", "success");
  }

  function resetBillboardKeDefault() {
    var configDefault = {
      mode: "pengumuman",
      tag: "",
      judul: "",
      isi: "",
      url: ""
    };
    document.getElementById("set-billboard-mode").value = "pengumuman";
    previewBillboardSetting();
    try {
      localStorage.setItem("SIAP DINAS_billboard_config", JSON.stringify(configDefault));
    } catch(e) {}
    renderBillboardLive(configDefault);
    showToast("Ruang Interaktif dikembalikan ke Mode Pengumuman.", "info");
  }

  /* ================= MANAJEMEN KOP INSTANSI & PIMPINAN (GOL. IV) ================= */
  function muatSettingInstansi() {
    var selKaban = document.getElementById("set-pimpinan-kaban");
    var selSekda = document.getElementById("set-pimpinan-sekda");
    if (!selKaban || !selSekda) return;

    selKaban.innerHTML = '<option value="">-- Memuat Pejabat Gol. IV... --</option>';
    selSekda.innerHTML = '<option value="">-- Memuat Pejabat Gol. IV... --</option>';

    google.script.run.withSuccessHandler(function(listPegawai) {
      // Filter cerdas: HANYA ambil pegawai yang memiliki Golongan IV (IV/a, IV/b, IV/c, IV/d, IV/e)
      var listGolIV = (listPegawai || []).filter(function(p) {
        return String(p.golongan || "").toUpperCase().indexOf("IV") > -1;
      });

      // Urutkan nama sesuai abjad
      listGolIV.sort(function(a, b) { return a.nama.localeCompare(b.nama); });

      var optHtml = '<option value="">-- Pilih Pejabat (Min. Gol. IV) --</option>';
      listGolIV.forEach(function(p) {
        optHtml += '<option value="' + p.nip + '" data-nama="' + p.nama.replace(/"/g, "&quot;") + '">' + p.nama + ' (' + p.golongan + ')</option>';
      });

      selKaban.innerHTML = optHtml;
      selSekda.innerHTML = optHtml;

      // Pra-pilih otomatis pejabat yang saat ini aktif di sheet db_pejabat
      google.script.run.withSuccessHandler(function(listPejabat) {
        if (listPejabat && listPejabat.length > 0) {
          listPejabat.forEach(function(item) {
            var pRole = String(item.peran || "").toLowerCase();
            if (pRole.indexOf("kepala badan") > -1) {
              selKaban.value = item.nip;
            } else if (pRole.indexOf("sekretaris") > -1) {
              selSekda.value = item.nip;
            }
          });
        }
      }).ambilSemuaPejabatAktif();
    }).ambilSemuaPegawaiLengkap();
  }

  function simpanSettingInstansi() {
    var dataInstansi = {
      nama: document.getElementById("set-instansi-nama").value,
      alamat: document.getElementById("set-instansi-alamat").value,
      telp: document.getElementById("set-instansi-telp").value,
      kodepos: document.getElementById("set-instansi-kodepos").value
    };
    try {
      localStorage.setItem("SIAP DINAS_instansi_config", JSON.stringify(dataInstansi));
    } catch(e) {}

    var selKaban = document.getElementById("set-pimpinan-kaban");
    var selSekda = document.getElementById("set-pimpinan-sekda");

    var dataKaban = null;
    if (selKaban && selKaban.value && selKaban.selectedIndex >= 0) {
      var optK = selKaban.options[selKaban.selectedIndex];
      dataKaban = { nip: selKaban.value, nama: optK.dataset.nama || "" };
    }

    var dataSekda = null;
    if (selSekda && selSekda.value && selSekda.selectedIndex >= 0) {
      var optS = selSekda.options[selSekda.selectedIndex];
      dataSekda = { nip: selSekda.value, nama: optS.dataset.nama || "" };
    }

    setBtnLoading("btn-update-instansi", true, "Menyimpan ke database...");

    google.script.run
      .withSuccessHandler(function(res) {
        setBtnLoading("btn-update-instansi", false);
        alert(res.pesan || "Identitas Kop & Pejabat Pimpinan berhasil disimpan!");
      })
      .withFailureHandler(function(err) {
        setBtnLoading("btn-update-instansi", false);
        alert("Gagal menyimpan: " + err.message);
      })
      .simpanPimpinanInstansi(dataKaban, dataSekda);
  }

  /* ================= MASTER PEGAWAI & PEJABAT ================= */
  var listPegawaiLengkap = [];

  function muatMasterPegawai() {
    var selectPegawai = document.getElementById("set-pilih-pegawai");
    var selectPejabat = document.getElementById("set-pejabat-pilih");

    if (selectPegawai) selectPegawai.innerHTML = '<option value="">-- Memuat Daftar Pegawai... --</option>';
    if (selectPejabat) selectPejabat.innerHTML = '<option value="">-- Memuat Daftar Pegawai... --</option>';

    google.script.run
      .withSuccessHandler(function(list) {
        listPegawaiLengkap = list || [];

        if (selectPegawai) {
          selectPegawai.innerHTML = '<option value="">-- Pilih Nama Pegawai Target --</option>';
          listPegawaiLengkap.forEach(function(p) {
            var opt = document.createElement("option");
            opt.value = p.nip;
            opt.textContent = p.nama + " (" + p.golongan + ")";
            selectPegawai.appendChild(opt);
          });
        }

        if (selectPejabat) {
          selectPejabat.innerHTML = '<option value="">-- Pilih Nama Pegawai --</option>';
          listPegawaiLengkap.forEach(function(p) {
            var opt = document.createElement("option");
            opt.value = p.nip;
            opt.textContent = p.nama + " (" + p.nip + ")";
            selectPejabat.appendChild(opt);
          });
        }

        muatDaftarPejabatAktif();
      })
      .withFailureHandler(function(err) {
        console.log("Gagal memuat pegawai:", err);
      })
      .ambilSemuaPegawaiLengkap();
  }

  function pilihPegawaiUntukEdit() {
    var nipDipilih = document.getElementById("set-pilih-pegawai").value;
    var nipInput = document.getElementById("set-pegawai-nip");
    var namaInput = document.getElementById("set-pegawai-nama");
    var pangkatInput = document.getElementById("set-pegawai-pangkat");
    var golonganInput = document.getElementById("set-pegawai-golongan");
    var jabatanInput = document.getElementById("set-pegawai-jabatan");

    if (!nipDipilih) {
      nipInput.value = ""; namaInput.value = ""; pangkatInput.value = ""; golonganInput.value = ""; jabatanInput.value = "";
      return;
    }

    var target = listPegawaiLengkap.find(function(p) { return String(p.nip).trim() === String(nipDipilih).trim(); });
    if (target) {
      nipInput.value = target.nip;
      namaInput.value = target.nama;
      pangkatInput.value = target.pangkat;
      golonganInput.value = target.golongan;
      jabatanInput.value = target.jabatan;
    }
  }

  function simpanSettingPegawai() {
    if (!isOtoritasTerbuka) {
      bukaModalGembok();
      return;
    }

    var nip = document.getElementById("set-pegawai-nip").value;
    if (!nip) {
      alert("Pilih nama pegawai yang ingin diedit terlebih dahulu!");
      return;
    }

    var dataKirim = {
      nip: nip,
      nama: document.getElementById("set-pegawai-nama").value,
      pangkat: document.getElementById("set-pegawai-pangkat").value,
      golongan: document.getElementById("set-pegawai-golongan").value,
      jabatan: document.getElementById("set-pegawai-jabatan").value
    };

    setBtnLoading("btn-update-pegawai", true, "Menyimpan...");

    google.script.run
      .withSuccessHandler(function(res) {
        setBtnLoading("btn-update-pegawai", false);
        alert(res.pesan);
        if (res.status === "sukses") muatMasterPegawai();
      })
      .withFailureHandler(function() {
        setBtnLoading("btn-update-pegawai", false);
      })
      .updateDataPegawai(dataKirim);
  }

  function pilihPegawaiUntukPejabat() {
    var nip = document.getElementById("set-pejabat-pilih").value;
    var target = listPegawaiLengkap.find(function(p) { return String(p.nip).trim() === String(nip).trim(); });
    if (target) {
      document.getElementById("set-pejabat-nip").value = target.nip;
      document.getElementById("set-pejabat-nama").value = target.nama;
    } else {
      document.getElementById("set-pejabat-nip").value = "";
      document.getElementById("set-pejabat-nama").value = "";
    }
  }

  function muatDaftarPejabatAktif() {
    var container = document.getElementById("container-list-pejabat-aktif");
    if (!container) return;

    google.script.run.withSuccessHandler(function(list) {
      if (!list || list.length === 0) {
        container.innerHTML = '<span class="text-slate-500 italic">Belum ada pejabat penandatangan terdaftar di database.</span>';
        return;
      }
      var html = "";
      list.forEach(function(item) {
        html += '<div class="flex items-center justify-between py-1.5 border-b border-slate-800/80">' +
                  '<div>' +
                    '<span class="text-emerald-400 font-bold">' + item.peran + '</span> ' +
                    '<span class="text-slate-500 text-[10px]">(' + item.bidang + ')</span>' +
                    '<div class="text-slate-300 text-[11px] font-medium">' + item.nama + ' <span class="text-slate-500 font-mono">NIP. ' + item.nip + '</span></div>' +
                  '</div>' +
                '</div>';
      });
      container.innerHTML = html;
      refreshIcons();
    }).ambilSemuaPejabatAktif();
  }

  function simpanSettingPejabatBaru() {
    if (!isOtoritasTerbuka) {
      bukaModalGembok();
      return;
    }

    var nip = document.getElementById("set-pejabat-nip").value;
    var nama = document.getElementById("set-pejabat-nama").value;
    var peran = document.getElementById("set-pejabat-peran").value;
    var bidang = document.getElementById("set-pejabat-bidang").value;

    if (!nip || !nama) {
      alert("Pilih nama pegawai dari database terlebih dahulu!");
      return;
    }

    var dataKirim = { nip: nip, nama: nama, peran: peran, bidang: bidang };

    setBtnLoading("btn-update-pejabat", true, "Menyimpan...");

    google.script.run
      .withSuccessHandler(function(res) {
        setBtnLoading("btn-update-pejabat", false);
        alert(res.pesan);
        if (res.status === "sukses") {
          muatDaftarPejabatAktif();
        }
      })
      .withFailureHandler(function() {
        setBtnLoading("btn-update-pejabat", false);
      })
      .simpanPejabatBaru(dataKirim);
  }

  /* ================= SISTEM GEMBOK AK STUDIO ================= */
  var isOtoritasTerbuka = false;

  function toggleGembokOtoritas() {
    if (!isOtoritasTerbuka) {
      bukaModalGembok();
    } else {
      kunciKembaliOtoritas();
    }
  }

  function terapkanStatusGembok() {
    var inputsInstansi = ["set-instansi-nama", "set-instansi-alamat", "set-instansi-telp", "set-instansi-kodepos"];
    var inputsPegawai = ["set-pegawai-golongan", "set-pegawai-nama", "set-pegawai-pangkat", "set-pegawai-jabatan"];
    var inputsPejabat = ["set-pejabat-pilih", "set-pejabat-peran", "set-pejabat-bidang"];
    
    var btnPegawai = document.getElementById("btn-update-pegawai");
    var btnInstansi = document.getElementById("btn-update-instansi");
    var btnPejabat = document.getElementById("btn-update-pejabat");

    var centralBtn = document.getElementById("btn-central-lock");
    var centralIcon = document.getElementById("central-lock-icon");
    var badgeKop = document.getElementById("badge-kop-surat");

    var semuaInputKunci = inputsInstansi.concat(inputsPegawai).concat(inputsPejabat);

    if (!isOtoritasTerbuka) {
      semuaInputKunci.forEach(function(id) {
        var el = document.getElementById(id);
        if (el) {
          el.disabled = (el.tagName === "SELECT");
          el.readOnly = true;
          el.classList.add("cursor-not-allowed", "opacity-50");
        }
      });

      if (btnPegawai) {
        btnPegawai.disabled = true;
        btnPegawai.onclick = simpanSettingPegawai;
        btnPegawai.className = "w-full py-2.5 bg-cyan-950 text-cyan-500 border border-cyan-800/50 font-bold text-xs rounded-xl opacity-40 cursor-not-allowed flex items-center justify-center gap-2";
      }
      if (btnInstansi) {
        btnInstansi.disabled = true;
        btnInstansi.onclick = simpanSettingInstansi;
        btnInstansi.className = "w-full py-2.5 bg-purple-950 text-purple-500 border border-purple-800/50 font-bold text-xs rounded-xl opacity-40 cursor-not-allowed flex items-center justify-center gap-2";
      }
      if (btnPejabat) {
        btnPejabat.disabled = true;
        btnPejabat.onclick = simpanSettingPejabatBaru;
        btnPejabat.className = "w-full py-2.5 bg-emerald-950 text-emerald-500 border border-emerald-800/50 font-bold text-xs rounded-xl opacity-40 cursor-not-allowed flex items-center justify-center gap-2";
      }

      if (centralIcon) {
        centralIcon.innerHTML = '<i data-lucide="lock" class="w-6 h-6 text-amber-400 stroke-[2]"></i>';
      }
      if (centralBtn) {
        centralBtn.title = "Kunci Sentral: Terkunci (Klik untuk Membuka)";
      }

      if (badgeKop) {
        badgeKop.className = "text-[10px] px-2 py-0.5 bg-purple-950 border border-purple-800 text-purple-300 rounded-md font-bold flex items-center gap-1 cursor-pointer";
        badgeKop.innerHTML = '<i data-lucide="lock" class="w-3 h-3"></i><span>KOP SURAT</span>';
        badgeKop.onclick = bukaModalGembok;
      }
    } else {
      semuaInputKunci.forEach(function(id) {
        var el = document.getElementById(id);
        if (el) {
          el.disabled = false;
          el.readOnly = false;
          el.classList.remove("cursor-not-allowed", "opacity-50");
        }
      });

      if (btnPegawai) {
        btnPegawai.disabled = false;
        btnPegawai.onclick = simpanSettingPegawai;
        btnPegawai.className = "w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-600/20 transition-all cursor-pointer active:scale-[0.99] flex items-center justify-center gap-2";
      }
      if (btnInstansi) {
        btnInstansi.disabled = false;
        btnInstansi.onclick = simpanSettingInstansi;
        btnInstansi.className = "w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow transition-all cursor-pointer flex items-center justify-center gap-2";
      }
      if (btnPejabat) {
        btnPejabat.disabled = false;
        btnPejabat.onclick = simpanSettingPejabatBaru;
        btnPejabat.className = "w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition-all cursor-pointer active:scale-[0.99] flex items-center justify-center gap-2";
      }

      if (centralIcon) {
        centralIcon.innerHTML = '<i data-lucide="unlock" class="w-6 h-6 text-emerald-400 stroke-[2]"></i>';
      }
      if (centralBtn) {
        centralBtn.title = "Kunci Sentral: TERBUKA (Klik untuk Mengunci Kembali!)";
      }

      if (badgeKop) {
        badgeKop.className = "text-[10px] px-2 py-0.5 bg-emerald-950 border border-emerald-700 text-emerald-300 rounded-md font-bold flex items-center gap-1";
        badgeKop.innerHTML = '<i data-lucide="unlock" class="w-3 h-3"></i><span>KOP SURAT (AKTIF)</span>';
      }
    }
    refreshIcons();
  }

  function kunciKembaliOtoritas() {
    isOtoritasTerbuka = false;
    terapkanStatusGembok();
    alert("Pintu Otoritas AK Studio berhasil dikunci rapat kembali!");
  }

  function bukaModalGembok() {
    var modal = document.getElementById("modalGembok");
    if (!modal) return;
    if (isOtoritasTerbuka) {
      kunciKembaliOtoritas();
      return;
    }
    document.getElementById("inputPassGembok").value = "";
    modal.classList.remove("hidden");
    refreshIcons();
    setTimeout(function() { 
      var inp = document.getElementById("inputPassGembok");
      if(inp) inp.focus(); 
    }, 150);
  }

  function tutupModalGembok() {
    var modal = document.getElementById("modalGembok");
    if (modal) modal.classList.add("hidden");
  }

  function deteksiEnterGembok(e) {
    if (e.keyCode === 13 || e.key === "Enter") {
      e.preventDefault();
      prosesVerifikasiGembok();
    }
  }

  function prosesVerifikasiGembok() {
    var pass = document.getElementById("inputPassGembok").value;
    if (!pass) {
      alert("Masukkan password otoritas terlebih dahulu!");
      return;
    }

    setBtnLoading("btn-buka-kunci", true, "Membuka...");

    google.script.run
      .withSuccessHandler(function(res) {
        setBtnLoading("btn-buka-kunci", false);
        if (res.status === "sukses") {
          isOtoritasTerbuka = true;
          tutupModalGembok();
          terapkanStatusGembok();
          alert(res.pesan);
        } else {
          alert(res.pesan);
        }
      })
      .withFailureHandler(function(err) {
        setBtnLoading("btn-buka-kunci", false);
        alert("Gagal koneksi server: " + err.message);
      })
      .verifikasiKunciAKStudio(pass);
  }

  window.addEventListener("load", function() {
    try {
      var savedBillboard = localStorage.getItem("SIAP DINAS_billboard_config");
      if (savedBillboard) {
        var cfg = JSON.parse(savedBillboard);
        renderBillboardLive(cfg);
        var selMode = document.getElementById("set-billboard-mode");
        if (selMode) {
          selMode.value = cfg.mode || "pengumuman";
          document.getElementById("set-billboard-tag").value = cfg.tag || "";
          document.getElementById("set-billboard-judul").value = cfg.judul || "";
          document.getElementById("set-billboard-isi").value = cfg.isi || "";
          document.getElementById("set-billboard-url").value = cfg.url || "";
          previewBillboardSetting();
        }
      } else {
        renderBillboardLive({ mode: "pengumuman" });
      }
    } catch(e) {}

    terapkanStatusGembok();
    refreshIcons();
  });
