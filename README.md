# LiftLog PWA

## PWA 2.2 · 11 November 2026

- เมนูด้านข้างสำหรับจอใหญ่และเมนูด้านล่างสำหรับมือถือ โหมดสีเดิมยังอยู่ครบ
- กล่องแก้ไขใช้งานด้วยคีย์บอร์ดได้ กด Escape เพื่อปิด มีป้ายกำกับช่องกรอกและสถานะตัวเลือกสำหรับโปรแกรมอ่านหน้าจอ
- เปิดแอปเดิมขณะออนไลน์ บันทึกค่าที่กำลังกรอกแล้วเลือก **อัปเดต** ตรวจเวอร์ชัน 2.2 ในหน้าตั้งค่า ไม่ต้องติดตั้งใหม่
- ระบบเก็บข้อมูลและรูปแบบไฟล์สำรองเหมือน 2.1 ไม่มีบริการภายนอกหรือฟอนต์ที่ต้องโหลดเพิ่ม

## PWA 2.1 · 5 October 2026

- Create custom exercises in the day/plan editor or Settings → My exercises.
- Choose Dumbbell (kg per dumbbell), Barbell (plates per side + editable bar weight), or Other / bodyweight.
- Exercises belong to the current profile, can be reused in its plans, and are included in backups.
- Existing history is unchanged. Custom dumbbell volume uses recorded weight × reps without automatically doubling it.
- Open the existing app online and accept Update. Settings shows 2.1 · 2026.10.05.

LiftLog เวอร์ชันเว็บแอปสำหรับติดตั้งบน iPhone ผ่าน Safari ใช้งานเวท คาร์ดิโอ แผนฝึก กราฟ และรายงานได้โดยไม่ต้องต่ออายุใบรับรองแอปทุก 7 วัน

## คุณสมบัติ

- แผน Lean, Build และแผนที่ตั้งเอง พร้อมตารางรายสัปดาห์และวันพัก
- เปลี่ยนท่าหรือโหมดเฉพาะวันนี้ หรือบันทึกลงแผนถาวร
- บันทึกน้ำหนักและจำนวนครั้งแยกทุกเซต เช่น 12 / 10 / 8
- จำค่าน้ำหนักล่าสุดไปยังเซตต่อไป และแสดงผลจากสัปดาห์ก่อน
- ประเมินแต่ละท่าว่าควรลด คง หรือเพิ่มน้ำหนักครั้งหน้า
- คาร์ดิโอและการเดิน พร้อมความเร็ว/ความชันของลู่วิ่งและพลังงานโดยประมาณ
- ผู้ใช้หลายคน แยกข้อมูล แผน และประวัติจากกัน
- กราฟเส้นน้ำหนัก, 1RM, ปริมาณยก และพลังงาน
- รายงานรายสัปดาห์หรือรายเดือน พร้อมคำสั่งดู/บันทึกเป็น PDF
- ภาษาไทยและอังกฤษ, โหมดสว่าง/มืด/ตามเครื่อง และ 4 โทนสี
- ทำงานออฟไลน์ เก็บข้อมูลใน IndexedDB และสำรอง/กู้คืนเป็นไฟล์ JSON

## เปิดทดสอบในเครื่อง

```sh
python3 -m http.server 4173
```

จากนั้นเปิด `http://localhost:4173` ด้วยเบราว์เซอร์ การติดตั้งจริงบน iPhone ต้องให้เว็บไซต์ทำงานผ่าน HTTPS

## ติดตั้งบน iPhone

เปิด URL ที่เผยแพร่ด้วย Safari แตะ **แชร์** แล้วเลือก **เพิ่มไปยังหน้าจอโฮม** เปิดแอปจากไอคอน LiftLog หนึ่งครั้งขณะออนไลน์เพื่อเก็บไฟล์สำหรับใช้งานออฟไลน์

ข้อมูลการฝึกอยู่เฉพาะในเบราว์เซอร์ของอุปกรณ์ จึงควรดาวน์โหลดไฟล์สำรองเป็นระยะ โดยเฉพาะก่อนล้างข้อมูล Safari หรือย้าย iPhone

## PWA 2.0 · 4 October 2026

- หน้า Today เน้นน้ำหนัก/จำนวนครั้ง พร้อมความคืบหน้าตามแผนแบบแอป iOS
- Barbell กรอกแผ่นข้างเดียว ปรับน้ำหนักบาร์ได้ และจำค่าถึงเซ็ตถัดไป กราฟคำนวณด้วยน้ำหนักรวม
- เวลาพักแยกตามผู้ใช้: อัตโนมัติ 60–90 วินาที เพิ่ม 30 วินาทีหรือข้ามได้
- วอร์มอัปไม่เริ่มเวลาพักและไม่นับในเป้าหมายเซ็ต
- ป้องกันการสร้างข้อมูลใหม่ทับเมื่ออ่านข้อมูลเดิมไม่สำเร็จ และแสดงตัวอย่างก่อนกู้คืนไฟล์สำรอง
- อัปเดตออฟไลน์เป็นชุดเดียว พร้อมปุ่มอัปเดต โดยไม่ล้างฐานข้อมูลโปรไฟล์

อัปเดตโดยเปิดแอปเดิมขณะออนไลน์ แล้วปิดและเปิดใหม่ หากมีแถบอัปเดตให้บันทึกค่าที่กำลังกรอกก่อนกด **อัปเดต** ตรวจเวอร์ชัน `2.0 · 2026.10.04` ในหน้าตั้งค่า ไม่ต้องลบแอปเดิมหรือล้างข้อมูล Safari

เวลาพักนับต่อเมื่อกลับเข้าแอป แต่ยังไม่มีการแจ้งเตือนบนหน้าจอล็อก ข้อมูล PWA กับแอป iOS แยกจากกัน

## Regression checks

With Node 22.16+ run `node --test tests/*.test.mjs`. For the browser checks, serve this directory on loopback (`python3 -m http.server 4180 --bind 127.0.0.1`). With Playwright and its browsers installed in your development environment, run `node tests/ui.cjs` and `BROWSER=webkit node tests/ui.cjs`. Use `PLAYWRIGHT_MODULE` for a separate test installation and `AXE_MODULE` for the path to axe.min.js to include automated WCAG checks. Tests use disposable profiles with synthetic workouts; the app has no runtime package dependencies.

### 2.2.1 · 12 November 2026

กู้คืนไฟล์ JSON ได้สูงสุด 32 MiB แอปตรวจข้อมูลก่อนแสดงปุ่มยืนยัน หากไฟล์ไม่ผ่าน ข้อมูลเดิมจะยังอยู่ เมื่อสองแท็บเปิดสมุดบันทึกเดียวกัน แท็บที่ข้อมูลเก่าจะเตือนให้โหลดใหม่ก่อนบันทึก หากอ่านข้อมูลเดิมได้แต่เปิดหน้าจอไม่ได้ สามารถดาวน์โหลดสำเนาข้อมูลเดิมจากหน้ากู้คืนได้

For the restore and concurrent-tab regression flow run `node tests/restore-ui.cjs` against the same loopback server as the UI tests.
