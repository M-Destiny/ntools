import { useState, useMemo } from 'react';

interface PortEntry {
  port: number | string;
  protocol: string;
  service: string;
  description: string;
  category: string;
}

const PORT_DATA: PortEntry[] = [
  // Well-known ports (0-1023)
  { port: 1, protocol: 'TCP/UDP', service: 'tcpmux', description: 'TCP Port Service Multiplexer', category: 'Well-Known' },
  { port: 7, protocol: 'TCP/UDP', service: 'echo', description: 'Echo Protocol', category: 'Well-Known' },
  { port: 9, protocol: 'TCP/UDP', service: 'discard', description: 'Discard Protocol (Null)', category: 'Well-Known' },
  { port: 11, protocol: 'TCP/UDP', service: 'systat', description: 'Active Users', category: 'Well-Known' },
  { port: 13, protocol: 'TCP/UDP', service: 'daytime', description: 'Daytime Protocol', category: 'Well-Known' },
  { port: 17, protocol: 'TCP/UDP', service: 'qotd', description: 'Quote of the Day', category: 'Well-Known' },
  { port: 19, protocol: 'TCP/UDP', service: 'chargen', description: 'Character Generator Protocol', category: 'Well-Known' },
  { port: 20, protocol: 'TCP', service: 'ftp-data', description: 'FTP Data Transfer', category: 'Well-Known' },
  { port: 21, protocol: 'TCP', service: 'ftp', description: 'File Transfer Protocol (Control)', category: 'Well-Known' },
  { port: 22, protocol: 'TCP/UDP', service: 'ssh', description: 'Secure Shell (SSH)', category: 'Well-Known' },
  { port: 23, protocol: 'TCP', service: 'telnet', description: 'Telnet Protocol', category: 'Well-Known' },
  { port: 25, protocol: 'TCP', service: 'smtp', description: 'Simple Mail Transfer Protocol', category: 'Well-Known' },
  { port: 37, protocol: 'TCP/UDP', service: 'time', description: 'Time Protocol', category: 'Well-Known' },
  { port: 42, protocol: 'TCP/UDP', service: 'nameserver', description: 'Host Name Server', category: 'Well-Known' },
  { port: 43, protocol: 'TCP', service: 'whois', description: 'WHOIS Protocol', category: 'Well-Known' },
  { port: 53, protocol: 'TCP/UDP', service: 'dns', description: 'Domain Name System', category: 'Well-Known' },
  { port: 67, protocol: 'UDP', service: 'dhcp-server', description: 'DHCP Server', category: 'Well-Known' },
  { port: 68, protocol: 'UDP', service: 'dhcp-client', description: 'DHCP Client', category: 'Well-Known' },
  { port: 69, protocol: 'UDP', service: 'tftp', description: 'Trivial File Transfer Protocol', category: 'Well-Known' },
  { port: 70, protocol: 'TCP', service: 'gopher', description: 'Gopher Protocol', category: 'Well-Known' },
  { port: 79, protocol: 'TCP', service: 'finger', description: 'Finger Protocol', category: 'Well-Known' },
  { port: 80, protocol: 'TCP', service: 'http', description: 'Hypertext Transfer Protocol', category: 'Well-Known' },
  { port: 88, protocol: 'TCP/UDP', service: 'kerberos', description: 'Kerberos Authentication', category: 'Well-Known' },
  { port: 109, protocol: 'TCP', service: 'pop2', description: 'Post Office Protocol v2', category: 'Well-Known' },
  { port: 110, protocol: 'TCP', service: 'pop3', description: 'Post Office Protocol v3', category: 'Well-Known' },
  { port: 111, protocol: 'TCP/UDP', service: 'rpcbind', description: 'ONC RPC Portmapper', category: 'Well-Known' },
  { port: 113, protocol: 'TCP', service: 'ident', description: 'Identification Protocol', category: 'Well-Known' },
  { port: 119, protocol: 'TCP', service: 'nntp', description: 'Network News Transfer Protocol', category: 'Well-Known' },
  { port: 123, protocol: 'UDP', service: 'ntp', description: 'Network Time Protocol', category: 'Well-Known' },
  { port: 135, protocol: 'TCP/UDP', service: 'msrpc', description: 'Microsoft RPC Endpoint Mapper', category: 'Well-Known' },
  { port: 137, protocol: 'UDP', service: 'netbios-ns', description: 'NetBIOS Name Service', category: 'Well-Known' },
  { port: 138, protocol: 'UDP', service: 'netbios-dgm', description: 'NetBIOS Datagram Service', category: 'Well-Known' },
  { port: 139, protocol: 'TCP', service: 'netbios-ssn', description: 'NetBIOS Session Service', category: 'Well-Known' },
  { port: 143, protocol: 'TCP', service: 'imap', description: 'Internet Message Access Protocol', category: 'Well-Known' },
  { port: 161, protocol: 'UDP', service: 'snmp', description: 'Simple Network Management Protocol', category: 'Well-Known' },
  { port: 162, protocol: 'UDP', service: 'snmptrap', description: 'SNMP Traps', category: 'Well-Known' },
  { port: 179, protocol: 'TCP', service: 'bgp', description: 'Border Gateway Protocol', category: 'Well-Known' },
  { port: 194, protocol: 'TCP', service: 'irc', description: 'Internet Relay Chat', category: 'Well-Known' },
  { port: 199, protocol: 'TCP/UDP', service: 'smux', description: 'SNMP Multiplexing', category: 'Well-Known' },
  { port: 389, protocol: 'TCP/UDP', service: 'ldap', description: 'Lightweight Directory Access Protocol', category: 'Well-Known' },
  { port: 443, protocol: 'TCP', service: 'https', description: 'HTTP Secure (TLS/SSL)', category: 'Well-Known' },
  { port: 445, protocol: 'TCP', service: 'microsoft-ds', description: 'Microsoft DS (SMB over TCP)', category: 'Well-Known' },
  { port: 465, protocol: 'TCP', service: 'smtps', description: 'SMTP over SSL', category: 'Well-Known' },
  { port: 514, protocol: 'UDP', service: 'syslog', description: 'Syslog', category: 'Well-Known' },
  { port: 515, protocol: 'TCP', service: 'lpr', description: 'Line Printer Daemon', category: 'Well-Known' },
  { port: 520, protocol: 'UDP', service: 'rip', description: 'Routing Information Protocol', category: 'Well-Known' },
  { port: 548, protocol: 'TCP', service: 'afp', description: 'Apple Filing Protocol', category: 'Well-Known' },
  { port: 554, protocol: 'TCP/UDP', service: 'rtsp', description: 'Real Time Streaming Protocol', category: 'Well-Known' },
  { port: 587, protocol: 'TCP', service: 'submission', description: 'SMTP Message Submission', category: 'Well-Known' },
  { port: 631, protocol: 'TCP/UDP', service: 'ipp', description: 'Internet Printing Protocol', category: 'Well-Known' },
  { port: 636, protocol: 'TCP', service: 'ldaps', description: 'LDAP over SSL', category: 'Well-Known' },
  { port: 873, protocol: 'TCP', service: 'rsync', description: 'rsync', category: 'Well-Known' },
  { port: 990, protocol: 'TCP', service: 'ftps', description: 'FTP over SSL', category: 'Well-Known' },
  { port: 993, protocol: 'TCP', service: 'imaps', description: 'IMAP over SSL', category: 'Well-Known' },
  { port: 995, protocol: 'TCP', service: 'pop3s', description: 'POP3 over SSL', category: 'Well-Known' },
  { port: 1023, protocol: 'TCP', service: 'reserved', description: 'Reserved', category: 'Well-Known' },

  // Registered ports (1024-49151) - Common ones
  { port: 1024, protocol: 'TCP/UDP', service: 'reserved', description: 'Reserved (start of dynamic ports)', category: 'Registered' },
  { port: 1080, protocol: 'TCP', service: 'socks', description: 'SOCKS Proxy', category: 'Registered' },
  { port: 1194, protocol: 'UDP', service: 'openvpn', description: 'OpenVPN', category: 'Registered' },
  { port: 1433, protocol: 'TCP', service: 'mssql', description: 'Microsoft SQL Server', category: 'Registered' },
  { port: 1434, protocol: 'UDP', service: 'mssql-m', description: 'Microsoft SQL Server Monitor', category: 'Registered' },
  { port: 1521, protocol: 'TCP', service: 'oracle', description: 'Oracle Database', category: 'Registered' },
  { port: 1723, protocol: 'TCP', service: 'pptp', description: 'PPTP VPN', category: 'Registered' },
  { port: 1812, protocol: 'UDP', service: 'radius', description: 'RADIUS Authentication', category: 'Registered' },
  { port: 1813, protocol: 'UDP', service: 'radius-acct', description: 'RADIUS Accounting', category: 'Registered' },
  { port: 2049, protocol: 'TCP/UDP', service: 'nfs', description: 'Network File System', category: 'Registered' },
  { port: 2121, protocol: 'TCP', service: 'ftp-proxy', description: 'FTP Proxy', category: 'Registered' },
  { port: 2375, protocol: 'TCP', service: 'docker', description: 'Docker REST API (unencrypted)', category: 'Registered' },
  { port: 2376, protocol: 'TCP', service: 'docker-tls', description: 'Docker REST API (TLS)', category: 'Registered' },
  { port: 2483, protocol: 'TCP', service: 'oracle-db', description: 'Oracle DB (unencrypted)', category: 'Registered' },
  { port: 2484, protocol: 'TCP', service: 'oracle-db-ssl', description: 'Oracle DB (SSL)', category: 'Registered' },
  { port: 3000, protocol: 'TCP', service: 'dev-server', description: 'Common Dev Server (React, Next.js, etc.)', category: 'Registered' },
  { port: 3001, protocol: 'TCP', service: 'dev-server-alt', description: 'Alternative Dev Server', category: 'Registered' },
  { port: 3128, protocol: 'TCP', service: 'squid', description: 'Squid Proxy', category: 'Registered' },
  { port: 3306, protocol: 'TCP', service: 'mysql', description: 'MySQL Database', category: 'Registered' },
  { port: 3389, protocol: 'TCP/UDP', service: 'rdp', description: 'Remote Desktop Protocol', category: 'Registered' },
  { port: 3690, protocol: 'TCP', service: 'svn', description: 'Subversion', category: 'Registered' },
  { port: 4000, protocol: 'TCP', service: 'dev-server-alt2', description: 'Alternative Dev Server (Jekyll, etc.)', category: 'Registered' },
  { port: 4321, protocol: 'TCP', service: 'asterisk', description: 'Asterisk Management', category: 'Registered' },
  { port: 4444, protocol: 'TCP', service: 'metasploit', description: 'Metasploit Default', category: 'Registered' },
  { port: 4567, protocol: 'TCP', service: 'sinatra', description: 'Sinatra Default', category: 'Registered' },
  { port: 5000, protocol: 'TCP', service: 'flask', description: 'Flask/UPnP Default', category: 'Registered' },
  { port: 5432, protocol: 'TCP', service: 'postgresql', description: 'PostgreSQL Database', category: 'Registered' },
  { port: 5672, protocol: 'TCP', service: 'amqp', description: 'RabbitMQ / AMQP', category: 'Registered' },
  { port: 5900, protocol: 'TCP', service: 'vnc', description: 'VNC Remote Desktop', category: 'Registered' },
  { port: 5984, protocol: 'TCP', service: 'couchdb', description: 'CouchDB', category: 'Registered' },
  { port: 6379, protocol: 'TCP', service: 'redis', description: 'Redis', category: 'Registered' },
  { port: 6667, protocol: 'TCP', service: 'irc', description: 'IRC', category: 'Registered' },
  { port: 6697, protocol: 'TCP', service: 'ircs', description: 'IRC over SSL', category: 'Registered' },
  { port: 7000, protocol: 'TCP', service: 'cassandra', description: 'Cassandra', category: 'Registered' },
  { port: 7001, protocol: 'TCP', service: 'cassandra-ssl', description: 'Cassandra SSL', category: 'Registered' },
  { port: 8000, protocol: 'TCP', service: 'dev-server-alt3', description: 'Common Dev Server (Django, etc.)', category: 'Registered' },
  { port: 8008, protocol: 'TCP', service: 'http-alt', description: 'HTTP Alternate', category: 'Registered' },
  { port: 8080, protocol: 'TCP', service: 'http-proxy', description: 'HTTP Proxy / Alt Web Server', category: 'Registered' },
  { port: 8081, protocol: 'TCP', service: 'http-alt2', description: 'HTTP Alternate 2', category: 'Registered' },
  { port: 8086, protocol: 'TCP', service: 'influxdb', description: 'InfluxDB', category: 'Registered' },
  { port: 8096, protocol: 'TCP', service: 'jellyfin', description: 'Jellyfin', category: 'Registered' },
  { port: 8443, protocol: 'TCP', service: 'https-alt', description: 'HTTPS Alternate', category: 'Registered' },
  { port: 8888, protocol: 'TCP', service: 'jupyter', description: 'Jupyter Notebook', category: 'Registered' },
  { port: 9000, protocol: 'TCP', service: 'php-fpm', description: 'PHP-FPM / SonarQube', category: 'Registered' },
  { port: 9090, protocol: 'TCP', service: 'prometheus', description: 'Prometheus', category: 'Registered' },
  { port: 9092, protocol: 'TCP', service: 'kafka', description: 'Apache Kafka', category: 'Registered' },
  { port: 9100, protocol: 'TCP', service: 'node-exporter', description: 'Prometheus Node Exporter', category: 'Registered' },
  { port: 9200, protocol: 'TCP', service: 'elasticsearch', description: 'Elasticsearch', category: 'Registered' },
  { port: 9300, protocol: 'TCP', service: 'elasticsearch-tcp', description: 'Elasticsearch Transport', category: 'Registered' },
  { port: 9418, protocol: 'TCP', service: 'git', description: 'Git Protocol', category: 'Registered' },
  { port: 9999, protocol: 'TCP', service: 'dev-alt', description: 'Development Alternative', category: 'Registered' },
  { port: 10000, protocol: 'TCP', service: 'webmin', description: 'Webmin', category: 'Registered' },
  { port: 11211, protocol: 'TCP', service: 'memcached', description: 'Memcached', category: 'Registered' },
  { port: 11300, protocol: 'TCP', service: 'beanstalkd', description: 'Beanstalkd', category: 'Registered' },
  { port: 27017, protocol: 'TCP', service: 'mongodb', description: 'MongoDB', category: 'Registered' },
  { port: 27018, protocol: 'TCP', service: 'mongodb-shard', description: 'MongoDB Shard', category: 'Registered' },
  { port: 27019, protocol: 'TCP', service: 'mongodb-config', description: 'MongoDB Config Server', category: 'Registered' },
  { port: 50000, protocol: 'TCP', service: 'db2', description: 'IBM DB2', category: 'Registered' },
  { port: 49151, protocol: 'TCP/UDP', service: 'registered-end', description: 'End of registered ports', category: 'Registered' },

  // Dynamic/Private ports (49152-65535)
  { port: 49152, protocol: 'TCP/UDP', service: 'dynamic-start', description: 'Start of dynamic/private ports', category: 'Dynamic/Private' },
  { port: 49153, protocol: 'TCP/UDP', service: 'dynamic', description: 'Dynamic/Private use', category: 'Dynamic/Private' },
  { port: 65535, protocol: 'TCP/UDP', service: 'dynamic-end', description: 'End of port range', category: 'Dynamic/Private' },
];

const CATEGORY_ORDER = ['Well-Known', 'Registered', 'Dynamic/Private'];

export default function PortReference() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [protocolFilter, setProtocolFilter] = useState<string>('All');
  const [copied, setCopied] = useState<number | string | null>(null);

  const filteredPorts = useMemo(() => {
    return PORT_DATA.filter(entry => {
      const searchStr = search.toLowerCase();
      const portStr = entry.port.toString();
      const matchesSearch = portStr.includes(searchStr) ||
        entry.service.toLowerCase().includes(searchStr) ||
        entry.description.toLowerCase().includes(searchStr);
      const matchesCategory = categoryFilter === 'All' || entry.category === categoryFilter;
      const matchesProtocol = protocolFilter === 'All' || entry.protocol.includes(protocolFilter);
      return matchesSearch && matchesCategory && matchesProtocol;
    });
  }, [search, categoryFilter, protocolFilter]);

  const categories = ['All', ...CATEGORY_ORDER];
  const protocols = ['All', 'TCP', 'UDP', 'TCP/UDP'];

  const copyPort = (port: number | string) => {
    navigator.clipboard.writeText(port.toString());
    setCopied(port);
    setTimeout(() => setCopied(null), 2000);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Well-Known': return 'var(--color-cat-wellknown, #22c55e)';
      case 'Registered': return 'var(--color-cat-registered, #3b82f6)';
      case 'Dynamic/Private': return 'var(--color-cat-dynamic, #f97316)';
      default: return 'var(--color-text-muted)';
    }
  };

  const getProtocolColor = (protocol: string) => {
    if (protocol.includes('TCP') && protocol.includes('UDP')) return 'var(--color-proto-both, #a855f7)';
    if (protocol.includes('TCP')) return 'var(--color-proto-tcp, #ef4444)';
    if (protocol.includes('UDP')) return 'var(--color-proto-udp, #06b6d4)';
    return 'var(--color-text-muted)';
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>Port Reference</h2>
        <p className="tool-desc">Complete reference of TCP/UDP port numbers with service names and descriptions. Search, filter, and copy port numbers.</p>
      </div>

      <div className="port-toolbar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by port, service, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-group">
          <label>Category</label>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="filter-select">
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label>Protocol</label>
          <select value={protocolFilter} onChange={(e) => setProtocolFilter(e.target.value)} className="filter-select">
            {protocols.map(proto => <option key={proto} value={proto}>{proto}</option>)}
          </select>
        </div>
      </div>

      <div className="port-grid">
        {filteredPorts.map(entry => (
          <div key={`${entry.port}-${entry.protocol}`} className="port-card">
            <div className="port-header" style={{ borderLeftColor: getCategoryColor(entry.category) }}>
              <span className="port-number">{entry.port}</span>
              <span className="port-service">{entry.service}</span>
            </div>
            <div className="port-meta">
              <span className="port-category" style={{ backgroundColor: getCategoryColor(entry.category) }}>
                {entry.category}
              </span>
              <span className="port-protocol" style={{ backgroundColor: getProtocolColor(entry.protocol) }}>
                {entry.protocol}
              </span>
            </div>
            <p className="port-description">{entry.description}</p>
            <button
              className={`copy-port-btn ${copied === entry.port ? 'copied' : ''}`}
              onClick={() => copyPort(entry.port)}
              title="Copy port number"
            >
              {copied === entry.port ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        ))}
      </div>

      {filteredPorts.length === 0 && (
        <div className="no-results">No ports match your search.</div>
      )}

      <div className="legend">
        <h4>Categories</h4>
        <div className="legend-items">
          {CATEGORY_ORDER.map(cat => (
            <span key={cat} className="legend-item" style={{ borderLeftColor: getCategoryColor(cat) }}>
              {cat} <span className="legend-desc">({cat === 'Well-Known' ? '0-1023' : cat === 'Registered' ? '1024-49151' : '49152-65535'})</span>
            </span>
          ))}
        </div>
      </div>

      <div className="legend">
        <h4>Protocols</h4>
        <div className="legend-items">
          <span key="TCP" className="legend-item" style={{ borderLeftColor: getProtocolColor('TCP') }}>TCP</span>
          <span key="UDP" className="legend-item" style={{ borderLeftColor: getProtocolColor('UDP') }}>UDP</span>
          <span key="TCP/UDP" className="legend-item" style={{ borderLeftColor: getProtocolColor('TCP/UDP') }}>TCP/UDP</span>
        </div>
      </div>
    </div>
  );
}