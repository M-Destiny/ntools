import { useState } from 'react';

interface LicenseTemplate {
  name: string;
  description: string;
  spdxId: string;
  content: string;
}

const LICENSE_TEMPLATES: LicenseTemplate[] = [
  {
    name: 'MIT',
    description: 'Permissive license with minimal restrictions',
    spdxId: 'MIT',
    content: `MIT License

Copyright (c) {year} {author}

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`
  },
  {
    name: 'Apache-2.0',
    description: 'Permissive license with patent grant',
    spdxId: 'Apache-2.0',
    content: `Apache License
Version 2.0, January 2004
http://www.apache.org/licenses/

TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION

1. Definitions.

"License" shall mean the terms and conditions for use, reproduction,
and distribution as defined by Sections 1 through 9 of this document.

"Licensor" shall mean the copyright owner or entity authorized by
the copyright owner that is granting the License.

"Legal Entity" shall mean the union of the acting entity and all
other entities that control, are controlled by, or are under common
control with that entity. For the purposes of this definition,
"control" means (i) the power, direct or indirect, to cause the
direction or management of such entity, whether by contract or
otherwise, or (ii) ownership of fifty percent (50%) or more of the
outstanding shares, or (iii) beneficial ownership of such entity.

"You" (or "Your") shall mean an individual or Legal Entity
exercising permissions granted by this License.

"Source" form shall mean the preferred form for making modifications,
including but not limited to software source code, documentation
source, and configuration files.

"Object" form shall mean any form resulting from mechanical
transformation or translation of a Source form, including but
not limited to compiled object code, generated documentation,
and conversions to other media types.

"Work" shall mean the work of authorship, whether in Source or
Object form, made available under the License, as indicated by a
copyright notice that is included in or attached to the work
(an example is provided in the Appendix below).

"Derivative Works" shall mean any work, whether in Source or Object
form, that is based on (or derived from) the Work and for which the
editorial revisions, annotations, elaborations, or other modifications
represent, as a whole, an original work of authorship. For the purposes
of this License, Derivative Works shall not include works that remain
separable from, or merely link (or bind by name) to the interfaces of,
the Work and Derivative Works thereof.

"Contribution" shall mean any work of authorship, including
the original version of the Work and any modifications or additions
to that Work or Derivative Works thereof, that is intentionally
submitted to Licensor for inclusion in the Work by the copyright owner
or by an individual or Legal Entity authorized to submit on behalf of
the copyright owner. For the purposes of this License, "submitted"
means any form of electronic, verbal, or written communication sent
to the Licensor or its representatives, including but not limited to
communication on electronic mailing lists, source code control systems,
and issue tracking systems that are managed by, or on behalf of, the
Licensor for the purpose of discussing and improving the Work, but
excluding communication that is conspicuously marked or otherwise
designated in writing by the copyright owner as "Not a Contribution."

"Contributor" shall mean Licensor and any individual or Legal Entity
on behalf of whom a Contribution has been received by Licensor and
subsequently incorporated within the Work.

2. Grant of Copyright License. Subject to the terms and conditions of
this License, each Contributor hereby grants to You a perpetual,
worldwide, non-exclusive, no-charge, royalty-free, irrevocable
copyright license to reproduce, prepare Derivative Works of,
publicly display, publicly perform, sublicense, and distribute the
Work and such Derivative Works in Source or Object form.

3. Grant of Patent License. Subject to the terms and conditions of
this License, each Contributor hereby grants to You a perpetual,
worldwide, non-exclusive, no-charge, royalty-free, irrevocable
(except as stated in this section) patent license to make, have made,
use, offer to sell, sell, import, and otherwise transfer the Work,
where such license applies only to those patent claims licensable
by such Contributor that are necessarily infringed by their
Contribution(s) alone or by combination of their Contribution(s)
with the Work to which such Contribution(s) was submitted. If You
institute patent litigation against any entity (including a
cross-claim or counterclaim in a lawsuit) alleging that the Work
or a Contribution incorporated within the Work constitutes direct
or contributory patent infringement, then any patent licenses
granted to You under this License for that Work shall terminate
as of the date such litigation is filed.

4. Redistribution. You may reproduce and distribute copies of the
Work or Derivative Works thereof in Source or Object form, with
or without modifications, and in Source or Object form, provided
that You meet the following conditions:

(a) You must give any other recipients of the Work or
Derivative Works a copy of this License; and

(b) You must cause any modified files to carry prominent notices
stating that You changed the files; and

(c) You must retain, in the form of any Derivative Works that
You distribute, all copyright, trademark, patent, and attribution
notices from the Source form of the Work, excluding those notices
that do not pertain to any part of the Derivative Works; and

(d) If the Work includes a "NOTICE" text file as part of its
distribution, then any Derivative Works that You distribute must
include a readable copy of the NOTICE file contained within the Work
(excluding any text that has been modified), or if such Derivative
Works do not include such a file, then You must include a NOTICE file
containing the attributions required by this License.

5. Submission of Contributions. Unless You explicitly state otherwise,
any Contribution intentionally submitted for inclusion in the Work
by You to the Licensor shall be under the terms and conditions of
this License, without any additional terms or conditions.
Notwithstanding the above, nothing herein shall supersede or modify
the terms of any separate license agreement you may have executed
with Licensor prior to receiving this License.

6. Trademarks. This License does not grant permission to use the trade
names, trademarks, service marks, or product names of the Licensor,
except as required for reasonable and customary use in describing the
origin of the Work and reproducing the content of the Notices.

7. Disclaimer of Warranty. Unless required by applicable law or
agreed to in writing, Licensor provides the Work (and each
Contributor provides its Contributions) on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
implied, including, without limitation, any warranties or conditions
of TITLE, NON-INFRINGEMENT, MERCHANTABILITY, or FITNESS FOR A
PARTICULAR PURPOSE. You are solely responsible for determining the
appropriateness of using or redistributing the Work and assume any
risks associated with Your exercise of permissions under this License.

8. Limitation of Liability. In no event and under no legal theory,
whether in tort (including negligence), contract, or otherwise,
unless required by applicable law or agreed to in writing, shall any
Contributor be liable to You for damages, including any direct,
indirect, special, incidental, or consequential damages of any
character arising as a result of this License or out of the use or
inability to use the Work (including but not limited to damages for
loss of goodwill, work stoppage, computer failure or malfunction, or
any and all other damages), even if such Contributor has been advised
of the possibility of such damages.

9. Accepting Warranty or Additional Liability. While redistributing
the Work or Derivative Works thereof, You may choose to offer,
and charge a fee for, acceptance of support, warranty, or indemnity
liability for the actions of other Contributors. The only requirement
is that such acceptance must be based on a real need, and that the
terms of such offer must be in accordance with the objectives of this
License.

APPENDIX: How to apply the Apache License to your work.

To apply the Apache License to your work, attach the following
boilerplate notice, with the fields enclosed by brackets "[]"
replaced with your own identifying information. (Don't include
the brackets!) The text should be wrapped in a format appropriate
for the medium of publication.

Copyright {year} {author}

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.`
  },
  {
    name: 'GPL-3.0',
    description: 'Copyleft license requiring derivative works to be open source',
    spdxId: 'GPL-3.0',
    content: `GNU GENERAL PUBLIC LICENSE
Version 3, 29 June 2007

Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
Everyone is permitted to copy and distribute verbatim copies
of this license document, but changing it is not allowed.

Preamble

The GNU General Public License is a free, copyleft license for
software and other kinds of works.

The licenses for most software and other practical works are designed
to take away your freedom to share and change the works. By contrast,
the GNU General Public License is intended to guarantee your freedom to
share and change all versions of a program--to make sure it remains free
software for all its users. We, the Free Software Foundation, use the
GNU General Public License for most of our software; it applies also to
any other work released this way by its authors. You can apply it to
your programs, too.

When we speak of free software, we are referring to freedom, not
price. Our General Public Licenses are designed to make sure that you
have the freedom to distribute copies of free software (and charge for
them if you wish), that you receive source code or can get it if you
want it, that you can change the software or use pieces of it in new
free programs, and that you know you can do these things.

To protect your rights, we need to prevent others from denying you
these rights or asking you to surrender the rights. Therefore, you have
certain responsibilities if you distribute copies of the software, or if
you modify it: responsibilities to respect the freedom of others.

For example, if you distribute copies of such a program, whether
gratis or for a fee, you must pass on to the recipients the same
freedoms that you received. You must make sure that they, too, receive
or can get the source code. And you must show them these terms so they
know their rights.

Developers that use the GNU GPL protect your rights with two steps:
(1) assert copyright on the software, and (2) offer you this License
giving you permission to copy, distribute and/or modify the software.

For the developers' and authors' protection, the GPL clearly explains
that there is no warranty for this free software. For both users' and
authors' sake, the GPL requires that modified versions be marked as
changed, so that their problems will not be attributed erroneously to
authors of previous versions.

Some devices are designed to deny users access to install or run
modified versions of the software inside them, although the manufacturer
can do so. This is fundamentally incompatible with the aim of protecting
users' freedom to change the software. The systematic pattern of such
abuse in the area of consumer products is a primary motivation for this
version of the GPL, as it is designed to prohibit this practice.

Finally, every program is threatened constantly by software patents.
States should not allow patents to restrict development and use of
software, and the GNU GPL is a tool to help prevent patents from
rendering a program unusable. The GPL is designed to prevent this.

The precise terms and conditions for copying, distribution and
modification follow.

TERMS AND CONDITIONS

0. Definitions.

"This License" refers to version 3 of the GNU General Public License.

"Copyright" also means copyright-like laws that apply to other kinds of
works, such as semiconductor masks.

"The Program" refers to any copyrightable work licensed under this
License. Each licensee is addressed as "you". "Licensees" and
"recipients" refer to individuals or organizations that receive the
Program.

"Modify" a work means to copy from or adapt all or part of the work
in a fashion requiring copyright permission, other than the making of
an exact copy. The resulting work is called a "modified version" of the
earlier work or a work "based on" the earlier work.

A "covered work" means either the unmodified Program or a work based
on the Program.

"Propagate" a work means to do anything with it that, without
permission, would make you directly or indirectly liable for infringement
under applicable copyright law, except executing it on a computer or
modifying it. "Convey" a work means any kind of propagation that
enables other parties to make copies of it. "Interactive user interfaces"
must display Appropriate Legal Notices, and a work's "source code" means
the preferred form of the work for making modifications of it.

1. Source Code.

The "source code" for a work means the preferred form of the work
for making modifications of it. "Object code" means any non-source
form of a work.

A "Standard Interface" means an interface that either is an official
standard defined by a recognized standards body, or, in the case of
interfaces specified for a particular job, one that is widely used
among developers working in that field.

A "System Library" means anything, other than the work as a whole,
that (a) is included in the normal packaging of a Consumer Product,
(b) is included in the normal packaging of a Consumer Product
solely to implement the features of that Consumer Product, and
(c) serves only to enable the Consumer Product to function.

A "Corresponding Source" for a work in object code form means all
the source code needed to generate, install, and (for an executable
work) run the object code and to modify the work, including scripts
to control those activities. However, it does not include the work's
System Libraries, or general-purpose tools or generally available free
programs that are used unmodified in doing those activities.

2. Basic Permissions.

All rights granted under this License are granted for the term of
copyright on the Program, and are irrevocable provided the stated
conditions are met. This License explicitly affirms your permission
to run the unmodified Program. The output from running a covered work
is covered by this License only if the output, given its content,
constitutes a covered work. This License acknowledges your rights of
fair use or other applicable rights under copyright law.

You may make, run and propagate covered works that you do not
convey, without conditions so long as your license otherwise remains
in force. You may convey covered works to others solely under the
conditions provided later in this License, including providing the
Corresponding Source of the work.

When you convey a copy of a covered work, you must at the same time
give the recipient the entire Corresponding Source of that work in a
reasonably convenient form under the terms of this License. You may
charge any price or no price for the copies, and you must keep the
Corresponding Source available. You may offer this warranty. You may
not impose any further restrictions on the recipients' exercise of the
rights granted herein.

3. Protecting Users' Legal Rights From Anti-Circumvention Law.

No covered work shall be deemed part of an effective technological
measure under any applicable law fulfilling the requirements of
article 11 of the WIPO copyright treaty adopted on 20 December 1996,
or any similar law in another jurisdiction.

When you convey a covered work, you waive any legal power to
"technologically restrict" the freedoms of the recipients that are
enforced by the laws of the country in question. You also waive any
legal power that the recipients might exercise against you.

4. Conveying Verbatim Copies.

You may convey verbatim copies of the Program's source code as you
receive it, in any medium, provided that you conspicuously and
appropriately display on each copy an appropriate copyright notice;
keep intact all notices stating that this License and any
non-License conditions apply to the work; keep intact all notices
referring to the existence and applicability of this License; and
give each recipient a copy of this License along with the Program.

You may charge any price or no price for the copies, and you may
offer this warranty. You may not impose any further restrictions on
the recipients' exercise of the rights granted herein.

5. Conveying Modified Source Versions.

You may convey a work based on the Program, or the modifications to
produce it from the Program, in the form of source code under the
terms of this License, provided that you also meet all of these conditions:

a) The work must carry prominent notices stating that you modified
it, and giving a relevant date.

b) The work must carry prominent notices that it is released under
this License and any conditions imposed under clause 3. You may
modify those conditions only as stated in clause 2.

c) You must license the entire work, as a whole, under this License
to anyone who comes into possession of it. This License applies to
the whole work, and all its parts, regardless of how they are
packaged. This License cannot be revoked from the whole work.

d) If the work has interactive user interfaces, each must display
Appropriate Legal Notices; however, if the Program has interactive
interfaces that do not display such notices, your work need not make
them do so.

6. Conveying Non-Source Forms.

You may convey a covered work in object code form under the terms
of sections 4 and 5, provided that you also convey the
machine-readable Corresponding Source under the terms of this License,
in one of these ways:

a) Convey the object code in, or embodied in, a physical product
(including a physical distribution medium), accompanied by the
Corresponding Source fixed on a durable physical medium
customarily used for software interchange; or

b) Convey the object code in, or embodied in, a physical product
(including a physical distribution medium), accompanied by a
written offer, valid for at least three years and valid for as
long as you offer spare parts or customer service for that product,
to give anyone who possesses the object code a copy of the
Corresponding Source on a durable physical medium customarily used
for software interchange, for a price no more than your reasonable
cost of physically performing this conveying, or, to the same extent,
the object code in a different medium, customarily used for software
interchange; or

c) Convey individual copies of the object code with a copy of the
Corresponding Source on a durable physical medium customarily used
for software interchange (or, in a different medium, customarily used
for software interchange), at no charge, for a particular occasion;
provided that you do not, as a general policy, use this means of
conveying the object code; or

d) Convey the object code by offering access from a designated place
(gratis or for a price), and offer equivalent access to the
Corresponding Source in the same way through the same place at
no additional charge. You need not supervise the conveyance.

7. Additional Terms.

"Additional permissions" are terms that supplement the terms of this
License by making exceptions from one or more of its conditions.
Additional permissions that are applicable to the whole Program shall
be treated as though they were included in this License, to the extent
that they are applicable. If you convey a work that is based on the
Program and contains additional permissions, you may remove some
or all of those permissions. You may remove additional permissions
applicable to the whole work. If a covered work has additional
permissions applicable only to part of it, those permissions shall
apply only to that part.

8. Termination.

You may not propagate or convey a covered work except as expressly
provided under this License. Any attempt otherwise to propagate or
convey a covered work is void, and will automatically terminate your
rights under this License (including any patent licenses granted under
the third and fourth paragraph of section 2). However, if you cease
all violation of this License, then your license from a particular
copyright holder is reinstated (a) provisionally, unless and until
the copyright holder explicitly and finally terminates your license,
and (b) permanently, if the copyright holder fails to notify you of
the termination by some reasonable means prior to 60 days after the
cessation.

Moreover, your license from a particular copyright holder is reinstated
permanently if the copyright holder notifies you of the termination by
some reasonable means prior to 60 days after the cessation.

Termination of your rights under this License also terminates the
patent licenses granted to you under this License.

9. Acceptance Not Required for Having Copies.

You are not required to accept this License in order to receive or
run a copy of the Program. Ancestral propagation of a covered work
does not require acceptance. However, nothing other than this License
grants you the right to propagate or convey a covered work. By
conveying a covered work, you accept this License and its conditions.

10. Automatic Licensing of Downstream Recipients.

Each time you convey a covered work, the recipient automatically
receives a license from the original licensors, to run, modify and
propagate that work, subject to this License. You are not responsible
for enforcing the License on works you do not convey.

11. Patents.

A "contributor" is a copyright holder who authorizes the use of
the work under this License. The "essential patent claims" of a
contributor are the patent claims in one or more patents owned or
controlled by the contributor that are already licensed by the
contributor under this License, or that would be licensed under
the terms of this License if the work were modified to satisfy
the conditions of section 3. Each contributor grants to the
community a non-exclusive license to run, modify, and convey the
work, subject to this License. If a contributor conveys a covered
work that includes a patent claim licensed under this License, the
contributor will not enforce that patent claim against others who
use the work as covered by this License. If a contributor sues
you for patent infringement on a covered work, the patent licenses
granted to you under this License for that work are terminated.

12. No Surrender of Others' Freedom.

If conditions are imposed on you that conflict with the conditions
of this License, you cannot accept them and still convey the covered
work. If you cannot accept those conditions and still convey the
covered work, your license from the contributor's copyright holder
is terminated.

13. Use with the GNU Affero General Public License.

Notwithstanding any other provision of this License, you have
permission to link or combine any covered work with a work licensed
under version 3 of the GNU Affero General Public License into a
single combined work, and to convey the resulting work. The terms of
the resulting work's license will be the terms of this License with
section 13 of the GNU Affero General Public License applied to the
linking clause.

14. Revised Versions of this License.

The Free Software Foundation may publish revised and/or new versions
of the GNU General Public License from time to time. Such new versions
will be similar in spirit to the present version, but may differ in
detail to address new issues that arise. Each new version will be given
a distinguishing version number. If the Program specifies that a
certain version number of the GNU General Public License "or any later
version" applies to it, you have the option of following the terms
and conditions of either that version or of any later version published
by the Free Software Foundation. If the Program does not specify a
version number of the GNU General Public License, you may only accept
the terms and conditions of this specific version.

15. Disclaimer of Warranty.

THERE IS NO WARRANTY FOR THE PROGRAM, TO THE EXTENT APPLICABLE
TO THE TERMS OF THIS LICENSE. EXCEPT WHEN OTHERWISE STATED IN
WRITING, THE COPYRIGHT HOLDERS AND/OR OTHER PARTIES PROVIDE THE
PROGRAM "AS IS" WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESSED OR
IMPLIED, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE. THE ENTIRE
RISK AS TO THE QUALITY AND PERFORMANCE OF THE PROGRAM IS WITH YOU.
SHOULD THE PROGRAM PROVE DEFECTIVE, YOU HAVE THE RESPONSIBILITY TO
OBTAIN REPAIRS OR REPLACEMENT OF THE PROGRAM.

16. Limitation of Liability.

IN NO EVENT UNLESS REQUIRED BY APPLICABLE LAW OR AGREED TO IN
WRITING WILL ANY COPYRIGHT HOLDER OR CONTRIBUTOR BE LIABLE TO YOU
FOR DAMAGES, INCLUDING ANY DIRECT, INDIRECT, SPECIAL, INCIDENTAL,
OR CONSEQUENTIAL DAMAGES ARISING FROM THE USE OR INABILITY TO USE
THE PROGRAM (INCLUDES BUT NOT LIMITED TO LOSS OF DATA OR DATA BEING
RENDERED UNUSEABLE), EVEN IF SUCH COPYRIGHT HOLDER OR CONTRIBUTOR
HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.

17. Interpretation of Sections 16 and 17.

If the disclaimer of warranty and limitation of liability provided
above cannot be given under local law, the courts should interpret
them in a way that makes the conditions and results of this License
as close as possible to the conditions and results of the GNU GPL,
with the consequence that the conditions and results of the GNU GPL
are satisfied.

END OF TERMS AND CONDITIONS

How to Apply These Terms to Your New Programs

If you develop a new program, and you want it to be of the greatest
possible use to the public, the best way to achieve this is to make it
free software which everyone can redistribute and change under these terms.

To do so, attach the following notices to the program. It is safest to
attach them to the very beginning of each source file to most effectively
state the exclusion of warranty; and each file should have at least the
"copyright" line and a pointer to where the full notice is found.

    {name}
    Copyright (C) {year} {author}

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program. If not, see <https://www.gnu.org/licenses/>.

Also add information on how to contact you by electronic and paper mail.

If the program does terminal interaction, make it output a short
notice like this when it starts in an interactive mode:

    {name}  Copyright (C) {year} {author}
    This program comes with ABSOLUTELY NO WARRANTY; for details type \`show w'.
    This is free software, and you are welcome to redistribute it
    under certain conditions; type \`show c' for details.

The hypothetical commands \`show w' and \`show c' should show the appropriate
parts of the GNU General Public License. Of course, your commands might
be different; you should use whatever commands are appropriate for your
particular program.`
  },
  {
    name: 'BSD-3-Clause',
    description: 'Permissive license similar to MIT with 3 clauses',
    spdxId: 'BSD-3-Clause',
    content: `BSD 3-Clause License

Copyright (c) {year}, {author}
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its
   contributors may be used to endorse or promote products derived from
   this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.`
  },
  {
    name: 'ISC',
    description: 'Simple permissive license similar to MIT',
    spdxId: 'ISC',
    content: `ISC License

Copyright (c) {year}, {author}

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.`
  },
  {
    name: 'Unlicense',
    description: 'Public domain dedication',
    spdxId: 'Unlicense',
    content: `This is free and unencumbered software released into the public domain.

Anyone is free to copy, modify, publish, use, compile, sell, or
distribute this software, either in source code form or as a compiled
binary, for any purpose, commercial or non-commercial, and by any
means.

In jurisdictions that recognize copyright laws, the author or authors
of this software dedicate any and all copyright interest in the
software to the public domain. We make this dedication for the benefit
of the public at large and to the detriment of our heirs and
successors. We intend this dedication to be an overt act of
relinquishment in perpetuity of all present and future rights to this
software under copyright law.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

For more information, please refer to <https://unlicense.org/>`
  },
];

export default function LicenseGenerator() {
  const [selectedLicense, setSelectedLicense] = useState('MIT');
  const [author, setAuthor] = useState('');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [projectName, setProjectName] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  const template = LICENSE_TEMPLATES.find(t => t.name === selectedLicense);

  const generateLicense = () => {
    if (!template) return '';
    let content = template.content
      .replace(/{year}/g, year)
      .replace(/{author}/g, author)
      .replace(/{name}/g, projectName || 'Project');
    setOutput(content);
  };

  const copyToClipboard = () => {
    if (output) {
      navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadFile = () => {
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'LICENSE';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>License Generator</h2>
        <p className="tool-desc">Generate license files for your projects. Choose from popular open source licenses and customize with your details.</p>
      </div>

      <div className="tool-grid">
        <div className="panel controls-panel">
          <div className="control-group">
            <label>License</label>
            <select
              value={selectedLicense}
              onChange={e => setSelectedLicense(e.target.value)}
              className="license-select"
            >
              {LICENSE_TEMPLATES.map(l => (
                <option key={l.name} value={l.name}>
                  {l.name} ({l.spdxId})
                </option>
              ))}
            </select>
            <p className="license-desc">{template?.description}</p>
          </div>

          <div className="control-group">
            <label>Year</label>
            <input
              type="number"
              value={year}
              onChange={e => setYear(e.target.value)}
              min="1970"
              max={new Date().getFullYear() + 1}
              className="control-input"
            />
          </div>

          <div className="control-group">
            <label>Author / Copyright Holder</label>
            <input
              type="text"
              value={author}
              onChange={e => setAuthor(e.target.value)}
              placeholder="Your name or organization"
              className="control-input"
            />
          </div>

          <div className="control-group">
            <label>Project Name (optional)</label>
            <input
              type="text"
              value={projectName}
              onChange={e => setProjectName(e.target.value)}
              placeholder="Project name (for GPL header)"
              className="control-input"
            />
          </div>

          <button onClick={generateLicense} className="btn-primary generate-btn">
            Generate License
          </button>

          {output && (
            <div className="output-actions">
              <button onClick={copyToClipboard} className={`btn-secondary ${copied ? 'copied' : ''}`}>
                {copied ? '✓ Copied!' : 'Copy to Clipboard'}
              </button>
              <button onClick={downloadFile} className="btn-secondary">
                Download LICENSE
              </button>
            </div>
          )}
        </div>

        <div className="panel preview-panel">
          <h3>Preview</h3>
          {output ? (
            <pre className="license-preview"><code>{output}</code></pre>
          ) : (
            <div className="empty-state">
              <p>Fill in the details and click "Generate License" to preview.</p>
            </div>
          )}
        </div>
      </div>

      <div className="license-info">
        <details>
          <summary>License Comparison</summary>
          <div className="help-content">
            <table>
              <thead>
                <tr>
                  <th>License</th>
                  <th>Type</th>
                  <th>Commercial Use</th>
                  <th>Modification</th>
                  <th>Distribution</th>
                  <th>Patent Grant</th>
                  <th>Private Use</th>
                  <th>Copyleft</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>MIT</td>
                  <td>Permissive</td>
                  <td>✓</td>
                  <td>✓</td>
                  <td>✓</td>
                  <td>✗</td>
                  <td>✓</td>
                  <td>✗</td>
                </tr>
                <tr>
                  <td>Apache-2.0</td>
                  <td>Permissive</td>
                  <td>✓</td>
                  <td>✓</td>
                  <td>✓</td>
                  <td>✓</td>
                  <td>✓</td>
                  <td>✗</td>
                </tr>
                <tr>
                  <td>GPL-3.0</td>
                  <td>Copyleft</td>
                  <td>✓</td>
                  <td>✓</td>
                  <td>✓</td>
                  <td>✓</td>
                  <td>✓</td>
                  <td>✓ (Strong)</td>
                </tr>
                <tr>
                  <td>BSD-3-Clause</td>
                  <td>Permissive</td>
                  <td>✓</td>
                  <td>✓</td>
                  <td>✓</td>
                  <td>✗</td>
                  <td>✓</td>
                  <td>✗</td>
                </tr>
                <tr>
                  <td>ISC</td>
                  <td>Permissive</td>
                  <td>✓</td>
                  <td>✓</td>
                  <td>✓</td>
                  <td>✗</td>
                  <td>✓</td>
                  <td>✗</td>
                </tr>
                <tr>
                  <td>Unlicense</td>
                  <td>Public Domain</td>
                  <td>✓</td>
                  <td>✓</td>
                  <td>✓</td>
                  <td>✗</td>
                  <td>✓</td>
                  <td>✗</td>
                </tr>
              </tbody>
            </table>
            <p><strong>Permissive:</strong> Minimal restrictions, can be used in proprietary software.</p>
            <p><strong>Copyleft:</strong> Derivative works must be licensed under the same terms.</p>
            <p><strong>Patent Grant:</strong> Explicitly grants patent rights from contributors.</p>
          </div>
        </details>
      </div>
    </div>
  );
}