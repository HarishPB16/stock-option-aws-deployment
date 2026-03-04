import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OptionStockDetailComponent } from './option-stock-detail.component';

describe('OptionStockDetailComponent', () => {
  let component: OptionStockDetailComponent;
  let fixture: ComponentFixture<OptionStockDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OptionStockDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OptionStockDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
