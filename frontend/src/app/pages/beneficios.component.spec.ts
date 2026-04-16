import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';

import { BeneficiosComponent } from './beneficios.component';
import { BeneficioService } from '../services/beneficio.service';
import { MatSnackBar } from '@angular/material/snack-bar';

describe('BeneficiosComponent', () => {
  let component: BeneficiosComponent;
  let fixture: ComponentFixture<BeneficiosComponent>;
  let serviceSpy: jasmine.SpyObj<BeneficioService>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

  beforeEach(async () => {
    serviceSpy = jasmine.createSpyObj('BeneficioService', [
      'list',
      'create',
      'update',
      'delete',
      'transfer'
    ]);

    snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    serviceSpy.list.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [BeneficiosComponent, NoopAnimationsModule],
      providers: [
        { provide: BeneficioService, useValue: serviceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BeneficiosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should load benefits on init', () => {
    expect(serviceSpy.list).toHaveBeenCalled();
  });

  it('should populate benefits on load success', () => {
    const mock = [
      { id: 1, nome: 'A', descricao: 'Desc A', valor: 100, ativo: true },
      { id: 2, nome: 'B', descricao: 'Desc B', valor: 50, ativo: false }
    ];

    serviceSpy.list.and.returnValue(of(mock));

    component.load();

    expect(component.beneficios.length).toBe(2);
    expect(component.ativos).toBe(1);
    expect(component.inativos).toBe(1);
    expect(component.valorTotal).toBe(150);
  });

  it('should show snackbar on load error', () => {
    snackBarSpy.open.calls.reset();
    serviceSpy.list.and.returnValue(
      throwError(() => ({ error: { message: 'Erro ao carregar' } }))
    );

    component.load();

    expect(snackBarSpy.open).toHaveBeenCalledWith(
      'Erro ao carregar benefícios.',
      'Fechar',
      jasmine.any(Object)
    );
  });

  it('should block save when required fields are invalid', () => {
    snackBarSpy.open.calls.reset();
    component.editandoId = null;

    component.novo = {
      nome: '',
      descricao: '',
      valor: 0,
      ativo: true
    };

    component.salvar();

    expect(serviceSpy.create).not.toHaveBeenCalled();
    expect(serviceSpy.update).not.toHaveBeenCalled();
    expect(snackBarSpy.open).toHaveBeenCalledWith(
      'Preencha nome, descrição e valor válido.',
      'Fechar',
      jasmine.any(Object)
    );
  });

  it('should create benefit when form is valid', () => {
    serviceSpy.create.and.returnValue(of({
      id: 1,
      nome: 'Novo',
      descricao: 'Teste',
      valor: 100,
      ativo: true
    }));

    spyOn(component, 'load');

    component.novo = {
      nome: 'Novo',
      descricao: 'Teste',
      valor: 100,
      ativo: true
    };

    component.salvar();

    expect(serviceSpy.create).toHaveBeenCalled();
    expect(serviceSpy.update).not.toHaveBeenCalled();
    expect(component.load).toHaveBeenCalled();
  });

  it('should update benefit when editing', () => {
    serviceSpy.update.and.returnValue(of({
      id: 1,
      nome: 'Atualizado',
      descricao: 'Teste',
      valor: 200,
      ativo: true
    }));

    spyOn(component, 'load');

    component.editandoId = 1;
    component.novo = {
      id: 1,
      nome: 'Atualizado',
      descricao: 'Teste',
      valor: 200,
      ativo: true
    };

    component.salvar();

    expect(serviceSpy.update).toHaveBeenCalledWith(1, {
      id: 1,
      nome: 'Atualizado',
      descricao: 'Teste',
      valor: 200,
      ativo: true
    });

    expect(serviceSpy.create).not.toHaveBeenCalled();
    expect(component.load).toHaveBeenCalled();
  });

  it('should fill form when editing a benefit', () => {
    component.editar({
      id: 1,
      nome: 'Benefício A',
      descricao: 'Descrição A',
      valor: 100,
      ativo: true
    });

    expect(component.editandoId).toBe(1);
    expect(component.novo.nome).toBe('Benefício A');
    expect(component.novo.descricao).toBe('Descrição A');
    expect(component.novo.valor).toBe(100);
    expect(component.novoValorInput).toContain('R$');
  });

  it('should cancel editing', () => {
    component.editandoId = 1;
    component.novo = {
      id: 1,
      nome: 'Teste',
      descricao: 'Desc',
      valor: 100,
      ativo: false
    };
    component.novoValorInput = 'R$ 100,00';

    component.cancelarEdicao();

    expect(component.editandoId).toBeNull();
    expect(component.novo.nome).toBe('');
    expect(component.novo.descricao).toBe('');
    expect(component.novo.valor).toBe(0);
    expect(component.novo.ativo).toBeTrue();
    expect(component.novoValorInput).toBe('');
  });

  it('should inactivate benefit', () => {
    serviceSpy.delete.and.returnValue(of(void 0));
    spyOn(component, 'load');

    component.excluir(1);

    expect(serviceSpy.delete).toHaveBeenCalledWith(1);
    expect(component.load).toHaveBeenCalled();
  });

  it('should transfer amount', () => {
    serviceSpy.transfer.and.returnValue(of(void 0));
    spyOn(component, 'load');

    component.transferencia = {
      fromId: 1,
      toId: 2,
      amount: 50
    };

    component.transferir();

    expect(serviceSpy.transfer).toHaveBeenCalledWith({
      fromId: 1,
      toId: 2,
      amount: 50
    });
    expect(component.load).toHaveBeenCalled();
    expect(component.transferencia.fromId).toBeNull();
    expect(component.transferencia.toId).toBeNull();
    expect(component.transferencia.amount).toBeNull();
  });

  it('should block transfer when invalid', () => {
    snackBarSpy.open.calls.reset();

    component.transferencia = {
      fromId: null,
      toId: 2,
      amount: 50
    };

    component.transferir();

    expect(serviceSpy.transfer).not.toHaveBeenCalled();
    expect(snackBarSpy.open).toHaveBeenCalledWith(
      'Informe origem, destino e valor válido.',
      'Fechar',
      jasmine.any(Object)
    );
  });

  it('should clear destination when same option is selected in origin', () => {
    component.transferencia.toId = 2;

    component.onFromChange(2);

    expect(component.transferencia.toId).toBeNull();
  });

  it('should clear origin when same option is selected in destination', () => {
    component.transferencia.fromId = 3;

    component.onToChange(3);

    expect(component.transferencia.fromId).toBeNull();
  });

  it('should format benefit value input', () => {
    component.onValorChange('1234');

    expect(component.novo.valor).toBe(12.34);
    expect(component.novoValorInput).toContain('R$');
  });

  it('should format transfer value input', () => {
    component.onTransferenciaValorChange('5678');

    expect(component.transferencia.amount).toBe(56.78);
    expect(component.transferenciaValorInput).toContain('R$');
  });
});